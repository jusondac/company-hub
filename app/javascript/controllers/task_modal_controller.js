import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="task-modal"
export default class extends Controller {
  static targets = ["detail", "edit"]
  static values = {
    taskId: Number,
  }

  connect() {
    // We only add listeners once when the controller connects
    document.addEventListener('turbo:load', this.resetModals.bind(this))
  }

  disconnect() {
    document.removeEventListener('turbo:load', this.resetModals.bind(this))
  }

  resetModals() {
    // Reset any open modals when navigating
    const modals = document.querySelectorAll('[data-modal-backdrop]')
    modals.forEach(modal => {
      if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden')
        modal.classList.remove('flex')
      }
    })
  }

  openDetail(event) {
    event.preventDefault()
    event.stopPropagation()

    const taskId = event.currentTarget.dataset.taskId || this.taskIdValue
    const boardId = event.currentTarget.dataset.boardId || this.boardIdValue

    if (!taskId) {
      console.error("No task ID provided")
      return
    }

    // Show the appropriate modal for this task
    const detailModal = document.getElementById(`task-detail-modal-${taskId}`)
    if (detailModal) {
      // Show the modal
      detailModal.classList.remove('hidden')
      detailModal.classList.add('flex')

      // Fetch and display task details
      this.loadTaskDetails(boardId, taskId)
    } else {
      console.error(`No modal found for task ID ${taskId}`)
    }
  }

  openEdit(event) {
    event.preventDefault()
    event.stopPropagation()

    const taskId = event.currentTarget.dataset.taskId || this.taskIdValue

    if (!taskId) {
      console.error("No task ID provided")
      return
    }

    // Close any open detail modals first
    const detailModal = document.getElementById(`task-detail-modal-${taskId}`)
    if (detailModal && !detailModal.classList.contains('hidden')) {
      detailModal.classList.add('hidden')
      detailModal.classList.remove('flex')
    }

    // Show the edit modal
    const editModal = document.getElementById('task-edit-modal')
    if (editModal) {
      // Update task ID value for the edit modal controller
      if (!this.element.dataset.taskModalTaskIdValue) {
        this.element.dataset.taskModalTaskIdValue = taskId
      }

      // Show the modal
      editModal.classList.remove('hidden')
      editModal.classList.add('flex')

      // Load the task edit form
      this.loadTaskEditForm(taskId)
    }
  }

  // Load task details via AJAX
  loadTaskDetails(taskId) {
    const detailContentDiv = document.getElementById(`task-detail-content-${taskId}`)
    if (!detailContentDiv) return

    // Show loading state
    detailContentDiv.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div><p class="mt-4 text-gray-500 dark:text-gray-400">Loading task details...</p></div>'

    // Fetch task details
    fetch(`boards/${boardId}/tasks/${taskId}`, {
      headers: {
        'Accept': 'text/html, application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.text()
      })
      .then(html => {
        detailContentDiv.innerHTML = html
      })
      .catch(error => {
        console.error('Error loading task details:', error)
        detailContentDiv.innerHTML = '<div class="p-5 text-center text-red-500">Failed to load task details. Please try again.</div>'
      })
  }

  // Load task edit form via AJAX
  loadTaskEditForm(taskId) {
    const editContentDiv = document.getElementById('task-edit-content')
    if (!editContentDiv) return

    // Show loading state
    editContentDiv.innerHTML = '<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div><p class="mt-4 text-gray-500 dark:text-gray-400">Loading task editor...</p></div>'

    // Fetch task edit form
    fetch(`/tasks/${taskId}/edit`, {
      headers: {
        'Accept': 'text/html, application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.text()
      })
      .then(html => {
        editContentDiv.innerHTML = html
      })
      .catch(error => {
        console.error('Error loading task edit form:', error)
        editContentDiv.innerHTML = '<div class="p-5 text-center text-red-500">Failed to load task edit form. Please try again.</div>'
      })
  }
}
