import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"

// Connects to data-controller="sortable"
export default class extends Controller {
  static targets = ["list"]
  static values = {
    url: String,
    handle: String
  }

  connect() {
    this.sortable = Sortable.create(this.listTarget, {
      handle: this.handleValue || ".drag-handle",
      animation: 150,
      onEnd: this.onEnd.bind(this)
    })
  }

  disconnect() {
    if (this.sortable) {
      this.sortable.destroy()
    }
  }

  onEnd(event) {
    const items = Array.from(this.listTarget.children).map((item, index) => ({
      id: item.dataset.id,
      position: index + 1
    }))

    fetch(this.urlValue, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ items })
    }).then(response => {
      if (!response.ok) {
        console.error("Failed to update positions")
      }
    }).catch(error => {
      console.error("Error:", error)
    })
  }
}
