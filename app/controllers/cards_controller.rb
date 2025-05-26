class CardsController < ApplicationController
  before_action :set_board
  before_action :set_card, only: [ :edit, :update, :destroy ]

  def new
    @card = @board.cards.build

    if request.xhr?
      render partial: "modal_form", layout: false
    end
  end

  def create
    @card = @board.cards.build(card_params)
    @card.position = @board.cards.count + 1

    if @card.save
      redirect_to board_path(@board), notice: "Card was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    if request.xhr?
      render partial: "modal_form", layout: false
    end
  end

  def update
    if @card.update(card_params)
      redirect_to board_path(@board), notice: "Card was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    # Move tasks to the first available card before destroying
    first_card = @board.cards.where.not(id: @card.id).ordered_by_position.first
    if first_card
      @card.tasks.update_all(card_id: first_card.id)
    end

    @card.destroy
    redirect_to board_path(@board), notice: "Card was successfully deleted."
  end

  def sort_position
    params[:items].each do |item|
      card = @board.cards.find(item[:id])
      card.update(position: item[:position])
    end

    head :ok
  end

  private

  def set_board
    @board = Board.find(params[:board_id])
  end

  def set_card
    @card = @board.cards.find(params[:id])
  end

  def card_params
    params.require(:card).permit(:title, :color, :position)
  end
end
