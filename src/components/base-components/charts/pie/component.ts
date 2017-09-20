import { PieChart } from './../../../../model/client/charts/PieChart';
declare var d3: any;

class PieChartComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            id: 'default',
            type: 'pie',
            chartData: {}
        };
    }

    public onInput(input: any): void {
        if (input && input.chartData) {
            this.state.id = input.chartId || this.state.id;
            this.state.chartData = input.chartData;
        }
    }
    public onMount(): void {
        PieChart.createChart(this.state.id, this.state.chartData);
    }
}

module.exports = PieChartComponent;
