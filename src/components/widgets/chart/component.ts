import { ChartFactory, ChartConfiguration } from './../../../model/client/charts/';
import { ChartComponentState } from './model/ChartComponentState';

class ChartWidgetComponent {

    public state: ChartComponentState;

    public onCreate(input: any): void {
        this.state = new ChartComponentState();
    }

    public onInput(input: any): void {
        // TODO: just for testing!
        // input.configuration.chartType = 'bar';
        // input.configuration.chartType = 'stacked-bar';
        // input.configuration.chartType = 'stacked-bar-horizontal';

        this.state.configuration = input.configuration || {};
        (this as any).emit('updateContentConfigurationHandler', this.updateContentConfigurationHandler.bind(this));
    }

    public onMount(): void {
        if (this.state.configuration) {
            ChartFactory.createChart(this.state.svgId, this.state.configuration);
        }
    }

    private updateContentConfigurationHandler(configuration: ChartConfiguration) {
        this.state.configuration = configuration;
        ChartFactory.createChart(this.state.svgId, this.state.configuration);
    }
}

module.exports = ChartWidgetComponent;
