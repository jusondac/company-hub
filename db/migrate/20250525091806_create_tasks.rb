class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title
      t.text :description
      t.references :board, null: false, foreign_key: true
      t.integer :position

      t.timestamps
    end
  end
end
