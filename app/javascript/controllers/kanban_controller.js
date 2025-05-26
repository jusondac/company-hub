import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"

// Connects to data-controller="kanban"
export default class extends Controller {
  static targets = ["column", "task"]
  static values = {
    url: String
  }

  connect() {
    this.initializeSortables()
  }

  disconnect() {
    this.destroySortables()
  }

  initializeSortables() {
    this.sortables = []

    // Make task columns sortable - allow dragging tasks between cards
    this.columnTargets.forEach(column => {
      const taskSortable = Sortable.create(column, {
        group: 'kanban-tasks', // Allow dragging between cards
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        filter: '.add-task-button', // Don't make the add task button draggable
        onStart: (evt) => {
          // Add visual feedback when drag starts
          evt.item.style.opacity = '0.8'
        },
        onEnd: (evt) => {
          // Reset visual feedback
          evt.item.style.opacity = '1'
          this.updateTaskPosition(evt)
        }
      })
      this.sortables.push(taskSortable)
    })
  }

  destroySortables() {
    if (this.sortables) {
      this.sortables.forEach(sortable => sortable.destroy())
      this.sortables = []
    }
  }

  updateTaskPosition(evt) {
    const taskId = evt.item.dataset.taskId
    const newCardElement = evt.to.closest('[data-card-id]')
    const newCardId = newCardElement.dataset.cardId
    const tasks = Array.from(evt.to.children).filter(child => child.dataset.taskId)
    const newPosition = tasks.indexOf(evt.item) + 1

    // Show loading state
    evt.item.style.opacity = '0.7'

    fetch(this.urlValue, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfToken()
      },
      body: JSON.stringify({
        task_id: taskId,
        card_id: newCardId,
        position: newPosition
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        // Success - restore opacity
        evt.item.style.opacity = '1'
        this.showSuccess('Task moved successfully')
      })
      .catch(error => {
        console.error('Error updating task position:', error)
        // Revert the visual change on error
        evt.item.style.opacity = '1'
        this.showError('Failed to move task. Please try again.')
        // Optionally reload the page to reset the state
        setTimeout(() => {
          location.reload()
        }, 2000)
      })
  }

  showSuccess(message) {
    this.showNotification(message, 'success')
  }

  showError(message) {
    this.showNotification(message, 'error')
  }

  showNotification(message, type) {
    // Create a simple notification
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white transition-all duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`
    notification.textContent = message

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
      notification.style.opacity = '1'
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      notification.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  csrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content')
  }
}
