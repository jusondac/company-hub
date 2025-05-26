class HomeController < ApplicationController
  def index
    @total_employees = Employee.count
    @total_boards = Board.count
    @total_tasks = Task.count
    @recent_tasks = Task.includes(:board, :employees).limit(5).order(created_at: :desc)
    @recent_boards = Board.includes(:employees, :tasks).limit(3).order(created_at: :desc)
  end
end
