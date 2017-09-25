import { StackedBarChartHorizontal } from './../../../../model/client/charts/';

declare var d3: any;

class StackedBarChartHorizontalComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            id: 'stacked-bar-chart-horizontal-' + Date.now(),
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
            StackedBarChartHorizontal.createChart(this.state.id, this.state.chartData);
        }
        // (this as any).emit('contentDataLoaded', this.state);
    }
}

module.exports = StackedBarChartHorizontalComponent;
