import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.initializeTheme()
    this.setupThemeToggle()
  }

  initializeTheme() {
    // Check if theme is stored in localStorage or use system preference
    if (localStorage.getItem('color-theme') === 'dark' ||
      (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      this.updateThemeToggleIcon(true)
    } else {
      document.documentElement.classList.remove('dark')
      this.updateThemeToggleIcon(false)
    }
  }

  setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle')
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', this.toggleTheme.bind(this))
    }
  }

  toggleTheme() {
    // Toggle dark mode
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('color-theme', 'light')
      this.updateThemeToggleIcon(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('color-theme', 'dark')
      this.updateThemeToggleIcon(true)
    }
  }

  updateThemeToggleIcon(isDark) {
    const darkIcon = document.getElementById('theme-toggle-dark-icon')
    const lightIcon = document.getElementById('theme-toggle-light-icon')

    if (darkIcon && lightIcon) {
      if (isDark) {
        // In dark mode, show the light icon (to switch to light)
        darkIcon.classList.add('hidden')
        lightIcon.classList.remove('hidden')
      } else {
        // In light mode, show the dark icon (to switch to dark)
        darkIcon.classList.remove('hidden')
        lightIcon.classList.add('hidden')
      }
    }
  }
}
