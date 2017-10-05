import { ChartFactory, ChartConfiguration } from '@kix/core/dist/model/client';
import { ChartComponentState } from './model/ChartComponentState';

class ChartWidgetComponent {

    public state: ChartComponentState;

    public onCreate(input: any): void {
        this.state = new ChartComponentState();
    }

    public onInput(input: any): void {
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

        // remove chart and add new with changed configuration
        document.getElementById(this.state.svgId).innerHTML = '';
        ChartFactory.createChart(this.state.svgId, this.state.configuration);
    }
}

module.exports = ChartWidgetComponent;
