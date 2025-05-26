class Task < ApplicationRecord
  # Associations
  belongs_to :board
  belongs_to :card, optional: true
  has_many :task_employees, dependent: :destroy
  has_many :employees, through: :task_employees

  # Validations
  validates :title, presence: true
  validates :description, presence: true
  validates :priority, inclusion: { in: %w[Low Medium High Critical], allow_blank: true }

  # Scopes
  scope :ordered_by_position, -> { order(:position) }

  ## update the ransackable below with column you want to add ransack
  def self.ransackable_attributes(auth_object = nil)
    [ "title", "description", "position", "board_id", "card_id", "priority" ]
  end

  def self.ransackable_associations(auth_object = nil)
    [ "board", "card", "employees" ]
  end
end
