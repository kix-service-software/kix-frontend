import { UIProperty } from '@kix/core/dist/model/client';

class ChartConfigurationComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            configuration: null,
            types: {}
        };
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;

        // TODO: get types with function (including types from extensions)
        this.state.types = {
            'pie': 'Pie chart',
            'bar': 'Bar chart',
            'stacked-bar': 'Stacked bar chart',
            'stacked-bar-horizontal': 'Stacked bar chart (horizontal)'
        };
    }

    public typeChanged(event): void {
        this.state.configuration.chartType = event.target.value;
    }

}

module.exports = ChartConfigurationComponent;
