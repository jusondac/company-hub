class Board < ApplicationRecord
  # Associations
  has_many :board_employees, dependent: :destroy
  has_many :employees, through: :board_employees
  has_many :cards, dependent: :destroy
  has_many :tasks, dependent: :destroy

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :description, presence: true

  # Callbacks
  after_create :create_default_cards

  ## update the ransackable below with column you want to add ransack
  def self.ransackable_attributes(auth_object = nil)
    [ "name", "description" ]
  end

  def self.ransackable_associations(auth_object = nil)
    [ "employees", "tasks", "cards" ]
  end

  private

  def create_default_cards
    default_cards = [
      { title: "To Do", position: 1, color: "#3B82F6" },      # Blue
      { title: "In Progress", position: 2, color: "#F59E0B" }, # Yellow
      { title: "Done", position: 3, color: "#10B981" }        # Green
    ]

    default_cards.each do |card_data|
      cards.create!(card_data)
    end
  end
end
