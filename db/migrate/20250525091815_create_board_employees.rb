class CreateBoardEmployees < ActiveRecord::Migration[8.0]
  def change
    create_table :board_employees do |t|
      t.references :board, null: false, foreign_key: true
      t.references :employee, null: false, foreign_key: true

      t.timestamps
    end
  end
end
