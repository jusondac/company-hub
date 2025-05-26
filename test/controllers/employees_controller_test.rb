require "test_helper"

class EmployeesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get employees_index_url
    assert_response :success
  end

  test "should get show" do
    get employees_show_url
    assert_response :success
  end

  test "should get new" do
    get employees_new_url
    assert_response :success
  end

  test "should get create" do
    get employees_create_url
    assert_response :success
  end

  test "should get edit" do
    get employees_edit_url
    assert_response :success
  end

  test "should get update" do
    get employees_update_url
    assert_response :success
  end

  test "should get destroy" do
    get employees_destroy_url
    assert_response :success
  end

  test "should get sort_position" do
    get employees_sort_position_url
    assert_response :success
  end
end
