class EmployeesController < ApplicationController
  before_action :set_employee, only: [ :show, :edit, :update, :destroy ]

  def index
    @employees = Employee.ordered_by_position
    @root_employees = Employee.root_employees.ordered_by_position
  end

  def tree_view
    @employees = Employee.all.includes(:parent, :children)
    @root_employees = Employee.root_employees.includes(:children)

    # Build hierarchical tree data
    @tree_data = build_hierarchical_tree(@root_employees)

    respond_to do |format|
      format.html
      format.json { render json: { tree_data: @tree_data } }
    end
  rescue => e
    Rails.logger.error "Error building tree data: #{e.message}"
    @tree_data = []

    respond_to do |format|
      format.html
      format.json { render json: { tree_data: [] } }
    end
  end

  def show
  end

  def new
    @employee = Employee.new
    @potential_parents = Employee.all
  end

  def create
    @employee = Employee.new(employee_params)

    if @employee.save
      redirect_to employees_path, notice: "Employee was successfully created."
    else
      @potential_parents = Employee.all
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @potential_parents = Employee.where.not(id: @employee.id)
  end

  def update
    if @employee.update(employee_params)
      redirect_to employee_path(@employee), notice: "Employee was successfully updated."
    else
      @potential_parents = Employee.where.not(id: @employee.id)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @employee.destroy
    redirect_to employees_path, notice: "Employee was successfully deleted."
  end

  def sort_position
    params[:items].each do |item|
      employee = Employee.find(item[:id])
      employee.update(position: item[:position])
    end

    head :ok
  end

  private

  def set_employee
    @employee = Employee.find(params[:id])
  end

  def employee_params
    params.require(:employee).permit(:email, :title, :username, :address, :parent_id, :position)
  end

  def build_hierarchical_tree(employees)
    employees.map do |employee|
      node = {
        id: employee.id.to_s,
        data: {
          name: employee.username,
          title: employee.title,
          email: employee.email,
          position: employee.position
        }
      }

      if employee.children.any?
        node[:children] = build_hierarchical_tree(employee.children)
      end

      node
    end
  end
end
