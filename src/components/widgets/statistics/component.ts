import { ChartFactory } from './../../../model/client/charts/ChartFactory';
import { ChartDataPreparer } from './../../../model/client/charts/data/ChartDataPreparer';

class StatisticsWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        let chartType = 'pie';
        if (input.configuration && input.configuration.chartType) {
            chartType = input.configuration.chartType;
        }

        // TODO: just for testing!
        // chartType = 'bar';
        // chartType = 'stacked-bar';
        chartType = 'stacked-bar-horizontal';

        const data = ChartDataPreparer.getData(input);

        this.state = {
            id: input.chartId || chartType + '-chart-' + Date.now(),
            chartType,
            chartData: data
        };
    }

    public onMount(): void {
        if (this.state.chartData) {
            ChartFactory.createChart(this.state.id, this.state.chartType, this.state.chartData);
        }
        // (this as any).emit('contentDataLoaded', this.state);
    }

    public contentDataLoaded(contentData: any): void {
        // this.state.contentData = contentData;
    }

    public onUpdateContentConfigurationHandler(handler: any): void {
        // this.updateContentConfigurationHandler = handler;
    }
}

module.exports = StatisticsWidgetComponent;
