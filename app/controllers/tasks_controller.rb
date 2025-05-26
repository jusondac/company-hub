class TasksController < ApplicationController
  before_action :set_board
  before_action :set_task, only: [ :show, :edit, :update, :destroy ]

  def index
    @tasks = @board.tasks.ordered_by_position
  end

  def show
    if request.xhr?
      render partial: "modal_show", layout: false
    end
  end

  def new
    @task = @board.tasks.build
    @task.card_id = params[:card_id] if params[:card_id].present?
    @employees = Employee.all

    if request.xhr?
      render partial: "modal_form", layout: false
    end
  end

  def create
    @task = @board.tasks.build(task_params)

    # Assign to first card (To Do) if no card specified
    if @task.card.nil?
      @task.card = @board.cards.ordered_by_position.first
    end

    if @task.save
      # Assign selected employees to task
      if params[:task][:employee_ids].present?
        params[:task][:employee_ids].each do |employee_id|
          @task.task_employees.create(employee_id: employee_id) if employee_id.present?
        end
      end
      redirect_to board_path(@board), notice: "Task was successfully created."
    else
      @employees = Employee.all
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @employees = Employee.all

    if request.xhr?
      render partial: "modal_form", layout: false
    end
  end

  def update
    if @task.update(task_params)
      # Update task employees
      @task.task_employees.destroy_all
      if params[:task][:employee_ids].present?
        params[:task][:employee_ids].each do |employee_id|
          @task.task_employees.create(employee_id: employee_id) if employee_id.present?
        end
      end
      redirect_to board_path(@board), notice: "Task was successfully updated."
    else
      @employees = Employee.all
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @task.destroy
    redirect_to board_path(@board), notice: "Task was successfully deleted."
  end

  def sort_position
    params[:items].each do |item|
      task = @board.tasks.find(item[:id])
      task.update(position: item[:position])
    end

    head :ok
  end

  def update_card
    task = @board.tasks.find(params[:task_id])
    new_card = @board.cards.find(params[:card_id])
    old_card = task.card

    # Update the task's card and position
    task.update(card: new_card, position: params[:position] || task.position)

    # Reorder positions in both cards
    if old_card && old_card != new_card
      # Reorder tasks in the old card
      old_card.tasks.where("position > ?", task.position).update_all("position = position - 1")
    end

    # Reorder tasks in the new card
    new_card.tasks.where.not(id: task.id).where("position >= ?", task.position).update_all("position = position + 1")

    head :ok
  end

  private

  def set_board
    @board = Board.find(params[:board_id])
  end

  def set_task
    @task = @board.tasks.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:title, :description, :position, :card_id, :priority)
  end
end
