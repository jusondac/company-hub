class CreateTaskEmployees < ActiveRecord::Migration[8.0]
  def change
    create_table :task_employees do |t|
      t.references :task, null: false, foreign_key: true
      t.references :employee, null: false, foreign_key: true

      t.timestamps
    end
  end
end
