import { Controller } from "@hotwired/stimulus"
// import ApexCharts from "apexcharts"
// import ApexTree from "apextree"

export default class extends Controller {
  static targets = ["chart"]

  connect() {
    console.log("NetworkChartController connected")
    const data = this.fetchTreeData()
  }

  disconnect() {
    if (this.chart) {
      this.chart.destroy()
    }
  }

  async fetchTreeData() {
    try {
      const data = await fetch('/employees/tree_view.json')

      if (!data.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const res = await data.json()
      this.renderNetworkChart(res.tree_data);
    } catch (error) {
      console.error("Error fetching tree data:", error)
      this.chartTarget.innerHTML = "<p class='text-red-500'>Error loading organizational data</p>"
    }
  }

  renderNetworkChart(data) {
    // const dummy = [{
    //   id: "1",
    //   name: "Alice",
    // children: [
    //     { id: "2", name: "Bob" },
    //     { id: "3", name: "Carol" }
    //   ]
    // }];
    // const options = {
    //   width: 700,
    //   height: 700,
    //   nodeWidth: 120,
    //   nodeHeight: 80,
    //   childrenSpacing: 100,
    //   siblingSpacing: 30,
    //   direction: 'top',
    //   canvasStyle: 'border: 1px solid black; background: #f6f6f6;',
    // };
    // const tree = new ApexTree(this.chartTarget, options);
    // tree.render(dummy);
  }
}
