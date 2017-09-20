import { BarChart } from './../../../../model/client/charts/';
declare var d3: any;

class BarChartComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            id: 'default',
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
        BarChart.createChart(this.state.id, this.state.chartData);
    }
}

module.exports = BarChartComponent;
