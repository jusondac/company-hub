class Card < ApplicationRecord
  # Associations
  belongs_to :board
  has_many :tasks, dependent: :nullify

  # Validations
  validates :title, presence: true
  validates :position, presence: true
  validates :color, presence: true

  # Scopes
  scope :ordered_by_position, -> { order(:position) }

  ## update the ransackable below with column you want to add ransack
  def self.ransackable_attributes(auth_object = nil)
    [ "id", "title", "position", "color", "board_id" ]
  end

  def self.ransackable_associations(auth_object = nil)
    [ "board", "tasks" ]
  end
end
