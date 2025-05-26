class CreateDefaultCardsForExistingBoards < ActiveRecord::Migration[8.0]
  def up
    # Create default cards for existing boards
    Board.find_each do |board|
      # Skip if cards already exist
      next if board.cards.any?

      default_cards = [
        { title: "To Do", position: 1, color: "#3B82F6" },      # Blue
        { title: "In Progress", position: 2, color: "#F59E0B" }, # Yellow
        { title: "Done", position: 3, color: "#10B981" }        # Green
      ]

      created_cards = []
      default_cards.each do |card_data|
        created_cards << board.cards.create!(card_data)
      end

      # Assign existing tasks to the first card ("To Do")
      if created_cards.any?
        board.tasks.where(card_id: nil).update_all(card_id: created_cards.first.id)
      end
    end
  end

  def down
    # Remove cards created by this migration
    Card.where(title: [ "To Do", "In Progress", "Done" ]).destroy_all
  end
end
