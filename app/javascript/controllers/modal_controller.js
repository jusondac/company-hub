import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="modal"
export default class extends Controller {
  static targets = ["dialog", "content"]
  static values = {
    url: String,
    size: { type: String, default: "md" }
  }

  connect() {
    // Create backdrop if it doesn't exist
    this.createBackdrop()

    // Handle escape key
    this.boundHandleEscape = this.handleEscape.bind(this)
    document.addEventListener('keydown', this.boundHandleEscape)
  }

  disconnect() {
    document.removeEventListener('keydown', this.boundHandleEscape)
    this.removeBackdrop()
  }

  createBackdrop() {
    if (!document.getElementById('modal-backdrop')) {
      const backdrop = document.createElement('div')
      backdrop.id = 'modal-backdrop'
      backdrop.className = 'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-200'
      backdrop.addEventListener('click', this.hide.bind(this))
      document.body.appendChild(backdrop)
    }
  }

  removeBackdrop() {
    const backdrop = document.getElementById('modal-backdrop')
    if (backdrop) {
      backdrop.remove()
    }
  }

  async open(event) {
    event?.preventDefault()

    const url = event?.currentTarget?.href || event?.currentTarget?.dataset?.modalUrlValue || this.urlValue
    if (!url) return

    try {
      // Show loading state
      this.showLoadingState()

      // Fetch modal content
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html, application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to load modal content')

      const html = await response.text()
      this.contentTarget.innerHTML = html

      // Show modal
      this.show()
    } catch (error) {
      console.error('Error loading modal:', error)
      this.showError('Failed to load content')
    }
  }

  show() {
    // Apply size class
    this.dialogTarget.className = this.getModalClasses()

    // Show backdrop
    const backdrop = document.getElementById('modal-backdrop')
    backdrop.classList.remove('hidden')

    // Show modal with animation
    this.element.classList.remove('hidden')
    document.body.style.overflow = 'hidden'

    // Trigger animation
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1'
      this.dialogTarget.style.transform = 'translate(-50%, -50%) scale(1)'
      this.dialogTarget.style.opacity = '1'
    })

    // Focus first input
    setTimeout(() => {
      const firstInput = this.element.querySelector('input, textarea, select')
      if (firstInput) firstInput.focus()
    }, 200)
  }

  hide() {
    const backdrop = document.getElementById('modal-backdrop')

    // Animate out
    backdrop.style.opacity = '0'
    this.dialogTarget.style.transform = 'translate(-50%, -50%) scale(0.95)'
    this.dialogTarget.style.opacity = '0'

    // Hide after animation
    setTimeout(() => {
      this.element.classList.add('hidden')
      backdrop.classList.add('hidden')
      document.body.style.overflow = ''
      this.contentTarget.innerHTML = ''
    }, 200)
  }

  showLoadingState() {
    this.contentTarget.innerHTML = `
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    `
    this.show()
  }

  showError(message) {
    this.contentTarget.innerHTML = `
      <div class="p-6 text-center">
        <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">${message}</p>
        <button data-action="click->modal#hide" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors">
          Close
        </button>
      </div>
    `
  }

  getModalClasses() {
    const baseClasses = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[90vh] overflow-y-auto transition-all duration-200'

    const sizeClasses = {
      sm: 'w-full max-w-md',
      md: 'w-full max-w-2xl',
      lg: 'w-full max-w-4xl',
      xl: 'w-full max-w-6xl'
    }

    return `${baseClasses} ${sizeClasses[this.sizeValue] || sizeClasses.md}`
  }

  handleEscape(event) {
    if (event.key === 'Escape' && !this.element.classList.contains('hidden')) {
      this.hide()
    }
  }

  // Handle form submissions within modal
  submitForm(event) {
    event.preventDefault()
    const form = event.target

    fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': this.csrfToken()
      }
    })
      .then(response => {
        if (response.ok) {
          // On success, hide modal and refresh page or update content
          this.hide()
          if (response.redirected) {
            window.location.href = response.url
          } else {
            window.location.reload()
          }
        } else {
          // On error, update modal content with error response
          return response.text().then(html => {
            this.contentTarget.innerHTML = html
          })
        }
      })
      .catch(error => {
        console.error('Error submitting form:', error)
        this.showError('Failed to submit form')
      })
  }

  csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  }
}
