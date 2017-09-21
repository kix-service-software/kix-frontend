import { BarChart } from './../../../../model/client/charts/';

declare var d3: any;

class BarChartComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            id: 'bar-chart-' + Date.now(),
            chartData: {}
        };
    }

    public onInput(input: any): void {
        if (input && input.chartData) {
            this.state.id = input.chartData.id || this.state.id;
            this.state.chartData = input.chartData;
        }
    }
    public onMount(): void {
        if (this.state.chartData) {
            BarChart.createChart(this.state.id, this.state.chartData);
        }
        // (this as any).emit('contentDataLoaded', this.state);
    }
}

module.exports = BarChartComponent;
