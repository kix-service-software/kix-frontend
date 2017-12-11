import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

class ChartConfigurationComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            configuration: null,
            instanceId: null,
            types: {}
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;

        // TODO: get types with function (including types from extensions)
        this.state.types = {
            'pie': 'Pie chart',
            'bar': 'Bar chart',
            'stacked-bar': 'Stacked bar chart',
            'stacked-bar-horizontal': 'Stacked bar chart (horizontal)'
        };
    }

    public onMount(): void {
        this.state.configuration = DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);
    }

    public typeChanged(event): void {
        this.state.configuration.chartType = event.target.value;
    }

    private saveConfiguration(): void {
        DashboardStore.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.configuration);
    }

}

module.exports = ChartConfigurationComponent;
