class BoardsController < ApplicationController
  before_action :set_board, only: [ :show, :edit, :update, :destroy ]

  def index
    @boards = Board.all
  end

  def show
    @cards = @board.cards.ordered_by_position.includes(:tasks)
    @tasks = @board.tasks.ordered_by_position
  end

  def new
    @board = Board.new
    @employees = Employee.all
  end

  def create
    @board = Board.new(board_params)

    if @board.save
      # Assign selected employees as managers
      if params[:board][:employee_ids].present?
        params[:board][:employee_ids].each do |employee_id|
          @board.board_employees.create(employee_id: employee_id) if employee_id.present?
        end
      end
      redirect_to boards_path, notice: "Board was successfully created."
    else
      @employees = Employee.all
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @employees = Employee.all
  end

  def update
    if @board.update(board_params)
      # Update board employees
      @board.board_employees.destroy_all
      if params[:board][:employee_ids].present?
        params[:board][:employee_ids].each do |employee_id|
          @board.board_employees.create(employee_id: employee_id) if employee_id.present?
        end
      end
      redirect_to board_path(@board), notice: "Board was successfully updated."
    else
      @employees = Employee.all
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @board.destroy
    redirect_to boards_path, notice: "Board was successfully deleted."
  end

  private

  def set_board
    @board = Board.find(params[:id])
  end

  def board_params
    params.require(:board).permit(:name, :description, employee_ids: [])
  end
end
