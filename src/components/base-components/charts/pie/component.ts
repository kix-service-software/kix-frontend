import { PieChart } from './../../../../model/client/charts/';

declare var d3: any;

class PieChartComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            id: 'pie-chart-' + Date.now(),
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
        PieChart.createChart(this.state.id, this.state.chartData);
        // (this as any).emit('contentDataLoaded', this.state);
    }
}

module.exports = PieChartComponent;
