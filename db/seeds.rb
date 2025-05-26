# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data
puts "Clearing existing data..."
TaskEmployee.delete_all
BoardEmployee.delete_all
Task.delete_all
Board.delete_all
Employee.delete_all

# Create the CEO first
puts "Creating employees..."
ceo = Employee.create!(
  email: "ceo@company.com",
  username: "ceo",
  title: "Chief Executive Officer",
  address: "123 Corporate Blvd, Suite 1000, Business City, BC 12345",
  position: 1
)

# Create department heads (reporting to CEO)
cto = Employee.create!(
  email: "cto@company.com",
  username: "cto",
  title: "Chief Technology Officer",
  address: "123 Corporate Blvd, Suite 800, Business City, BC 12345",
  parent: ceo,
  position: 2
)

cfo = Employee.create!(
  email: "cfo@company.com",
  username: "cfo",
  title: "Chief Financial Officer",
  address: "123 Corporate Blvd, Suite 700, Business City, BC 12345",
  parent: ceo,
  position: 3
)

hr_director = Employee.create!(
  email: "hr.director@company.com",
  username: "hr_director",
  title: "Director of Human Resources",
  address: "123 Corporate Blvd, Suite 600, Business City, BC 12345",
  parent: ceo,
  position: 4
)

# Create managers under CTO
dev_manager = Employee.create!(
  email: "dev.manager@company.com",
  username: "dev_manager",
  title: "Development Manager",
  address: "123 Corporate Blvd, Suite 500, Business City, BC 12345",
  parent: cto,
  position: 5
)

qa_manager = Employee.create!(
  email: "qa.manager@company.com",
  username: "qa_manager",
  title: "QA Manager",
  address: "123 Corporate Blvd, Suite 500, Business City, BC 12345",
  parent: cto,
  position: 6
)

# Create developers under development manager
senior_dev = Employee.create!(
  email: "senior.dev@company.com",
  username: "senior_dev",
  title: "Senior Software Developer",
  address: "123 Corporate Blvd, Suite 400, Business City, BC 12345",
  parent: dev_manager,
  position: 7
)

junior_dev1 = Employee.create!(
  email: "junior1@company.com",
  username: "junior_dev1",
  title: "Junior Software Developer",
  address: "123 Corporate Blvd, Suite 400, Business City, BC 12345",
  parent: dev_manager,
  position: 8
)

junior_dev2 = Employee.create!(
  email: "junior2@company.com",
  username: "junior_dev2",
  title: "Junior Software Developer",
  address: "123 Corporate Blvd, Suite 400, Business City, BC 12345",
  parent: dev_manager,
  position: 9
)

# Create QA engineers under QA manager
qa_lead = Employee.create!(
  email: "qa.lead@company.com",
  username: "qa_lead",
  title: "QA Lead",
  address: "123 Corporate Blvd, Suite 300, Business City, BC 12345",
  parent: qa_manager,
  position: 10
)

qa_engineer = Employee.create!(
  email: "qa.engineer@company.com",
  username: "qa_engineer",
  title: "QA Engineer",
  address: "123 Corporate Blvd, Suite 300, Business City, BC 12345",
  parent: qa_manager,
  position: 11
)

# Create finance team under CFO
accountant = Employee.create!(
  email: "accountant@company.com",
  username: "accountant",
  title: "Senior Accountant",
  address: "123 Corporate Blvd, Suite 200, Business City, BC 12345",
  parent: cfo,
  position: 12
)

finance_analyst = Employee.create!(
  email: "analyst@company.com",
  username: "finance_analyst",
  title: "Financial Analyst",
  address: "123 Corporate Blvd, Suite 200, Business City, BC 12345",
  parent: cfo,
  position: 13
)

# Create HR team under HR Director
hr_specialist = Employee.create!(
  email: "hr.specialist@company.com",
  username: "hr_specialist",
  title: "HR Specialist",
  address: "123 Corporate Blvd, Suite 100, Business City, BC 12345",
  parent: hr_director,
  position: 14
)

recruiter = Employee.create!(
  email: "recruiter@company.com",
  username: "recruiter",
  title: "Technical Recruiter",
  address: "123 Corporate Blvd, Suite 100, Business City, BC 12345",
  parent: hr_director,
  position: 15
)

puts "Created #{Employee.count} employees"

# Create boards with different managers
puts "Creating boards..."

# Development board managed by CTO
dev_board = Board.create!(
  name: "Software Development Board",
  description: "Main development board for tracking software projects and features"
)

# Add CTO as manager and other team members
BoardEmployee.create!(board: dev_board, employee: cto)
BoardEmployee.create!(board: dev_board, employee: dev_manager)
BoardEmployee.create!(board: dev_board, employee: senior_dev)
BoardEmployee.create!(board: dev_board, employee: junior_dev1)
BoardEmployee.create!(board: dev_board, employee: junior_dev2)

# QA board managed by QA Manager
qa_board = Board.create!(
  name: "Quality Assurance Board",
  description: "Board for tracking testing activities and quality metrics"
)

BoardEmployee.create!(board: qa_board, employee: qa_manager)
BoardEmployee.create!(board: qa_board, employee: qa_lead)
BoardEmployee.create!(board: qa_board, employee: qa_engineer)

# Finance board managed by CFO
finance_board = Board.create!(
  name: "Finance & Accounting Board",
  description: "Board for tracking financial activities and budgets"
)

BoardEmployee.create!(board: finance_board, employee: cfo)
BoardEmployee.create!(board: finance_board, employee: accountant)
BoardEmployee.create!(board: finance_board, employee: finance_analyst)

# HR board managed by HR Director
hr_board = Board.create!(
  name: "Human Resources Board",
  description: "Board for tracking recruitment and HR activities"
)

BoardEmployee.create!(board: hr_board, employee: hr_director)
BoardEmployee.create!(board: hr_board, employee: hr_specialist)
BoardEmployee.create!(board: hr_board, employee: recruiter)

puts "Created #{Board.count} boards"

# Create tasks for each board
puts "Creating tasks..."

# Development board tasks
dev_tasks = [
  { title: "Implement User Authentication", description: "Create secure login system with Rails authentication", position: 1 },
  { title: "Design Database Schema", description: "Design and implement database structure for the application", position: 2 },
  { title: "Build API Endpoints", description: "Create RESTful API endpoints for frontend consumption", position: 3 },
  { title: "Frontend UI Components", description: "Develop reusable UI components with Tailwind CSS", position: 4 },
  { title: "Integration Testing", description: "Write comprehensive integration tests for all features", position: 5 }
]

dev_tasks.each do |task_data|
  task = Task.create!(
    title: task_data[:title],
    description: task_data[:description],
    position: task_data[:position],
    board: dev_board
  )

  # Assign different developers to tasks
  case task_data[:position]
  when 1
    TaskEmployee.create!(task: task, employee: senior_dev)
    TaskEmployee.create!(task: task, employee: junior_dev1)
  when 2
    TaskEmployee.create!(task: task, employee: senior_dev)
  when 3
    TaskEmployee.create!(task: task, employee: junior_dev1)
    TaskEmployee.create!(task: task, employee: junior_dev2)
  when 4
    TaskEmployee.create!(task: task, employee: junior_dev2)
  when 5
    TaskEmployee.create!(task: task, employee: senior_dev)
    TaskEmployee.create!(task: task, employee: qa_lead)
  end
end

# QA board tasks
qa_tasks = [
  { title: "Test Plan Creation", description: "Create comprehensive test plans for new features", position: 1 },
  { title: "Automated Testing Setup", description: "Set up automated testing framework and CI/CD", position: 2 },
  { title: "Performance Testing", description: "Conduct performance and load testing", position: 3 },
  { title: "Security Audit", description: "Perform security testing and vulnerability assessment", position: 4 }
]

qa_tasks.each do |task_data|
  task = Task.create!(
    title: task_data[:title],
    description: task_data[:description],
    position: task_data[:position],
    board: qa_board
  )

  case task_data[:position]
  when 1, 3
    TaskEmployee.create!(task: task, employee: qa_lead)
  when 2, 4
    TaskEmployee.create!(task: task, employee: qa_engineer)
  end
end

# Finance board tasks
finance_tasks = [
  { title: "Q4 Budget Planning", description: "Prepare budget forecasts for next quarter", position: 1 },
  { title: "Monthly Financial Reports", description: "Generate and review monthly financial statements", position: 2 },
  { title: "Expense Audit", description: "Audit and categorize company expenses", position: 3 },
  { title: "Investment Analysis", description: "Analyze potential investment opportunities", position: 4 }
]

finance_tasks.each do |task_data|
  task = Task.create!(
    title: task_data[:title],
    description: task_data[:description],
    position: task_data[:position],
    board: finance_board
  )

  case task_data[:position]
  when 1, 4
    TaskEmployee.create!(task: task, employee: finance_analyst)
  when 2, 3
    TaskEmployee.create!(task: task, employee: accountant)
  end
end

# HR board tasks
hr_tasks = [
  { title: "Developer Recruitment", description: "Recruit senior and junior developers", position: 1 },
  { title: "Employee Onboarding", description: "Improve onboarding process for new hires", position: 2 },
  { title: "Performance Reviews", description: "Conduct quarterly performance reviews", position: 3 },
  { title: "Training Program", description: "Develop technical training program", position: 4 }
]

hr_tasks.each do |task_data|
  task = Task.create!(
    title: task_data[:title],
    description: task_data[:description],
    position: task_data[:position],
    board: hr_board
  )

  case task_data[:position]
  when 1, 4
    TaskEmployee.create!(task: task, employee: recruiter)
  when 2, 3
    TaskEmployee.create!(task: task, employee: hr_specialist)
  end
end

puts "Created #{Task.count} tasks"

# Create user for authentication
User.find_or_create_by(email_address: "user@gmail.com") do |user|
  user.password = "q1w2e3r4"
  user.password_confirmation = "q1w2e3r4"
end

puts "\n=== Seeding Complete ==="
puts "#{Employee.count} employees created"
puts "#{Board.count} boards created"
puts "#{Task.count} tasks created"
puts "#{BoardEmployee.count} board-employee relationships created"
puts "#{TaskEmployee.count} task-employee assignments created"
puts "\nLogin credentials:"
puts "Email: user@gmail.com"
puts "Password: q1w2e3r4"
puts "\nEmployees hierarchy:"
puts "CEO -> Department Heads -> Managers -> Team Members"
