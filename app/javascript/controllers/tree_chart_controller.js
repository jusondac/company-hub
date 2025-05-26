import { Controller } from "@hotwired/stimulus"
import ApexCharts from "apexcharts"

export default class extends Controller {
  static targets = ["chart"]
  static values = {
    employees: Array
  }

  connect() {
    this.renderOrgChart()
  }

  disconnect() {
    if (this.chart) {
      this.chart.destroy()
    }
  }

  renderOrgChart() {
    // Create a sunburst chart for organizational hierarchy
    const hierarchyData = this.buildHierarchyData()

    const options = {
      series: hierarchyData,
      chart: {
        height: 600,
        type: 'treemap',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        }
      },
      title: {
        text: 'Employee Organizational Structure',
        align: 'center',
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#374151'
        }
      },
      plotOptions: {
        treemap: {
          enableShades: true,
          shadeIntensity: 0.5,
          reverseNegativeShade: true,
          distributed: true,
          colorScale: {
            ranges: [
              { from: 0, to: 20, color: '#008FFB', name: 'CEO/Top Level' },
              { from: 21, to: 40, color: '#00E396', name: 'Management' },
              { from: 41, to: 60, color: '#FEB019', name: 'Senior Staff' },
              { from: 61, to: 80, color: '#FF4560', name: 'Staff' },
              { from: 81, to: 100, color: '#775DD0', name: 'Junior Staff' }
            ]
          }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#fff']
        },
        formatter: function (text, op) {
          const data = op.w.config.series[0].data[op.dataPointIndex]
          return [data.employee_name, data.title]
        }
      },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const employee = w.config.series[0].data[dataPointIndex]
          return `
            <div class="bg-white p-4 rounded-lg shadow-lg border max-w-xs">
              <div class="font-bold text-lg text-gray-800 mb-2">${employee.employee_name}</div>
              <div class="text-sm text-gray-600 space-y-1">
                <div><strong>Title:</strong> ${employee.title}</div>
                <div><strong>Position:</strong> ${employee.position}</div>
                <div><strong>Email:</strong> ${employee.email}</div>
                <div><strong>Level:</strong> ${employee.level}</div>
                ${employee.reports_count > 0 ? `<div><strong>Direct Reports:</strong> ${employee.reports_count}</div>` : ''}
              </div>
            </div>
          `
        }
      },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        markers: {
          width: 12,
          height: 12,
          radius: 2
        }
      }
    }

    this.chart = new ApexCharts(this.chartTarget, options)
    this.chart.render()
  }

  buildHierarchyData() {
    const employees = this.employeesValue
    const data = []

    employees.forEach(employee => {
      const level = this.calculateLevel(employee, employees)
      const reportsCount = this.getDirectReportsCount(employee, employees)

      // Calculate size based on level and number of reports
      // Top level gets larger size, and size increases with number of reports
      let size = 100 - (level * 15) // Base size decreases with level
      size += reportsCount * 5 // Add size for each direct report
      size = Math.max(size, 25) // Minimum size
      size = Math.min(size, 150) // Maximum size

      data.push({
        x: employee.username,
        y: size,
        employee_name: employee.username,
        title: employee.title,
        position: employee.position,
        email: employee.email,
        level: level,
        reports_count: reportsCount,
        fillColor: this.getLevelColor(level)
      })
    })

    return [{
      name: 'Employees',
      data: data
    }]
  }

  calculateLevel(employee, allEmployees) {
    let level = 0
    let current = employee

    while (current.parent_id) {
      level++
      current = allEmployees.find(emp => emp.id === current.parent_id)
      if (!current || level > 10) break // Safety check
    }

    return level
  }

  getDirectReportsCount(employee, allEmployees) {
    return allEmployees.filter(emp => emp.parent_id === employee.id).length
  }

  getLevelColor(level) {
    const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A']
    return colors[level % colors.length]
  }
}
