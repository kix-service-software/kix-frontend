import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

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
        const context = ContextService.getInstance().getContext();
        this.state.configuration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

    public typeChanged(event): void {
        this.state.configuration.chartType = event.target.value;
    }

    private saveConfiguration(): void {
        DashboardService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.configuration);
    }

}

module.exports = ChartConfigurationComponent;
