class CreateEmployees < ActiveRecord::Migration[8.0]
  def change
    create_table :employees do |t|
      t.string :email
      t.string :title
      t.string :username
      t.text :address
      t.integer :parent_id
      t.integer :position

      t.timestamps
    end
  end
end
