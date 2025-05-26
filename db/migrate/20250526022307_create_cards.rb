class CreateCards < ActiveRecord::Migration[8.0]
  def change
    create_table :cards do |t|
      t.string :title
      t.references :board, null: false, foreign_key: true
      t.integer :position
      t.string :color

      t.timestamps
    end
  end
end
