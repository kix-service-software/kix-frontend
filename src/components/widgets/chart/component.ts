import { ChartFactory, ChartConfiguration } from '@kix/core/dist/model/client';
import { ChartComponentState } from './model/ChartComponentState';

class ChartWidgetComponent {

    public state: ChartComponentState;

    public onCreate(input: any): void {
        this.state = new ChartComponentState();
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration || {};

        // remove chart and add new with changed configuration
        const element = document.getElementById(this.state.svgId);
        if (element) {
            element.innerHTML = '';
            ChartFactory.createChart(this.state.svgId, this.state.configuration);
        }
    }

    public onMount(): void {
        if (this.state.configuration) {
            ChartFactory.createChart(this.state.svgId, this.state.configuration);
        }
    }
}

module.exports = ChartWidgetComponent;
