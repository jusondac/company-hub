import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"

// Connects to data-controller="drag-drop-assign"
export default class extends Controller {
  static targets = ["availableList", "assignedList", "searchInput", "hiddenInput"]
  static values = {
    fieldName: String,
    initialAssigned: Array,
    maxAssigned: Number
  }

  connect() {
    this.initializeLists()
    this.setupSortable()
    this.setupSearch()
    this.loadInitialAssigned()
    this.updateCounters()
  }

  initializeLists() {
    this.assignedItems = new Set()
    this.allItems = Array.from(this.availableListTarget.children).map(item => ({
      id: item.dataset.id,
      element: item,
      searchText: item.dataset.searchText.toLowerCase()
    }))

    // Determine if this is single selection based on field name
    this.isSingleSelection = this.fieldNameValue.includes('parent_id')
    this.maxAssigned = this.isSingleSelection ? 1 : (this.maxAssignedValue || Infinity)
  }

  loadInitialAssigned() {
    if (this.initialAssignedValue && this.initialAssignedValue.length > 0) {
      this.initialAssignedValue.forEach(id => {
        const item = this.allItems.find(item => item.id === id.toString())
        if (item) {
          this.moveToAssigned(item.element)
        }
      })
    }
  }

  setupSortable() {
    // Available list - can drag items out
    this.availableSortable = Sortable.create(this.availableListTarget, {
      group: {
        name: 'assignment',
        pull: 'clone',
        put: true
      },
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onAdd: (event) => {
        // When item is moved back to available
        const id = event.item.dataset.id
        this.assignedItems.delete(id)
        this.updateHiddenInput()
        this.updateCounters()
        this.addRemoveAnimation(event.item)
        this.hideEmptyState()
      }
    })

    // Assigned list - can receive items and reorder
    this.assignedSortable = Sortable.create(this.assignedListTarget, {
      group: {
        name: 'assignment',
        pull: true,
        put: (to, from, dragEl) => {
          // Allow putting only if under max limit
          const currentCount = this.assignedListTarget.children.length
          const emptyState = this.assignedListTarget.querySelector('.assignment-empty')
          const actualCount = emptyState ? 0 : currentCount

          return actualCount < this.maxAssigned
        }
      },
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onAdd: (event) => {
        // Handle single selection - remove previous selection
        if (this.isSingleSelection) {
          const existingItems = Array.from(this.assignedListTarget.children)
            .filter(child => !child.classList.contains('assignment-empty') && child !== event.item)

          existingItems.forEach(item => {
            this.moveToAvailable(item)
          })
        }

        // When item is moved to assigned
        const id = event.item.dataset.id
        this.assignedItems.add(id)
        this.updateHiddenInput()
        this.updateCounters()
        this.addAssignAnimation(event.item)
        this.hideEmptyState()
      },
      onUpdate: () => {
        // When items are reordered within assigned list
        this.updateHiddenInput()
      }
    })
  }

  setupSearch() {
    if (this.hasSearchInputTarget) {
      this.searchInputTarget.addEventListener('input', this.filterItems.bind(this))

      // Show/hide clear button
      this.searchInputTarget.addEventListener('input', (e) => {
        const clearButton = this.element.querySelector('.clear-search')
        if (clearButton) {
          if (e.target.value.length > 0) {
            clearButton.classList.remove('hidden')
          } else {
            clearButton.classList.add('hidden')
          }
        }
      })
    }
  }

  filterItems(event) {
    const searchTerm = event.target.value.toLowerCase()

    this.allItems.forEach(item => {
      const shouldShow = item.searchText.includes(searchTerm)

      if (shouldShow) {
        item.element.style.display = ''
        item.element.classList.remove('hidden')
      } else {
        item.element.style.display = 'none'
        item.element.classList.add('hidden')
      }
    })

    // Add search animation
    this.availableListTarget.classList.add('search-updating')
    setTimeout(() => {
      this.availableListTarget.classList.remove('search-updating')
    }, 300)
  }

  moveToAssigned(element) {
    const clone = element.cloneNode(true)

    // For single selection, clear existing assignments
    if (this.isSingleSelection) {
      const existingItems = Array.from(this.assignedListTarget.children)
        .filter(child => !child.classList.contains('assignment-empty'))

      existingItems.forEach(item => {
        this.moveToAvailable(item)
      })
    }

    this.assignedListTarget.appendChild(clone)
    this.assignedItems.add(element.dataset.id)
    this.updateHiddenInput()
    this.updateCounters()
    this.addAssignAnimation(clone)
    this.hideEmptyState()
  }

  moveToAvailable(element) {
    const id = element.dataset.id
    this.assignedItems.delete(id)
    element.remove()
    this.updateHiddenInput()
    this.updateCounters()
    this.showEmptyStateIfNeeded()
  }

  hideEmptyState() {
    const emptyState = this.assignedListTarget.querySelector('.assignment-empty')
    if (emptyState) {
      emptyState.style.display = 'none'
    }
  }

  showEmptyStateIfNeeded() {
    const assignedCount = this.assignedListTarget.children.length
    const emptyState = this.assignedListTarget.querySelector('.assignment-empty')

    if (assignedCount === 0 || (assignedCount === 1 && emptyState)) {
      if (emptyState) {
        emptyState.style.display = 'flex'
      }
    }
  }

  updateCounters() {
    // Update available count
    const availableVisible = this.allItems.filter(item =>
      item.element.style.display !== 'none' && !item.element.classList.contains('hidden')
    ).length
    const availableCounter = this.element.querySelector('.assignment-column:first-child .assignment-count')
    if (availableCounter) {
      availableCounter.textContent = availableVisible
    }

    // Update assigned count
    const assignedCount = this.assignedItems.size
    const assignedCounter = this.element.querySelector('.assignment-column:last-child .assignment-count')
    if (assignedCounter) {
      assignedCounter.textContent = assignedCount
    }
  }

  addAssignAnimation(element) {
    element.classList.add('newly-assigned')
    setTimeout(() => {
      element.classList.remove('newly-assigned')
    }, 500)
  }

  addRemoveAnimation(element) {
    element.classList.add('newly-removed')
    setTimeout(() => {
      element.classList.remove('newly-removed')
    }, 500)
  }

  updateHiddenInput() {
    if (this.hasHiddenInputTarget) {
      // Clear existing hidden inputs
      this.hiddenInputTarget.innerHTML = ''

      // Create hidden inputs for each assigned item
      const assignedElements = Array.from(this.assignedListTarget.children)
        .filter(child => !child.classList.contains('assignment-empty'))

      assignedElements.forEach(element => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = this.fieldNameValue
        input.value = element.dataset.id
        this.hiddenInputTarget.appendChild(input)
      })
    }
  }

  clearSearch() {
    if (this.hasSearchInputTarget) {
      this.searchInputTarget.value = ''
      this.filterItems({ target: { value: '' } })

      // Hide clear button
      const clearButton = this.element.querySelector('.clear-search')
      if (clearButton) {
        clearButton.classList.add('hidden')
      }
    }
  }

  disconnect() {
    if (this.availableSortable) {
      this.availableSortable.destroy()
    }
    if (this.assignedSortable) {
      this.assignedSortable.destroy()
    }
  }
}
