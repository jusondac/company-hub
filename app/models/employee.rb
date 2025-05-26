class Employee < ApplicationRecord
  # Associations
  belongs_to :parent, class_name: "Employee", foreign_key: "parent_id", optional: true
  has_many :children, class_name: "Employee", foreign_key: "parent_id"
  has_many :board_employees, dependent: :destroy
  has_many :boards, through: :board_employees
  has_many :task_employees, dependent: :destroy
  has_many :tasks, through: :task_employees

  # Validations
  validates :email, presence: true, uniqueness: true
  validates :title, presence: true
  validates :username, presence: true, uniqueness: true
  validates :address, presence: true
  validates :position, presence: true, uniqueness: true

  # Scopes
  scope :ordered_by_position, -> { order(:position) }
  scope :root_employees, -> { where(parent_id: nil) }

  ## update the ransackable below with column you want to add ransack
  def self.ransackable_attributes(auth_object = nil)
    [ "email", "title", "username", "address", "parent_id", "position" ]
  end

  def self.ransackable_associations(auth_object = nil)
    [ "parent", "children", "boards", "tasks" ]
  end

  # Helper methods
  def is_root?
    parent_id.nil?
  end

  def hierarchy_level
    level = 0
    current = self
    while current.parent.present?
      level += 1
      current = current.parent
    end
    level
  end
end
