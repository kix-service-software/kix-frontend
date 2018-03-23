import { ChartFactory } from '@kix/core/dist/model';
import { ChartComponentState } from './model/ChartComponentState';
import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

class ChartWidgetComponent {

    private state: ChartComponentState;
    private chartFactory: ChartFactory;

    public onCreate(input: any): void {
        this.state = new ChartComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration && this.state.widgetConfiguration.settings) {
            this.chartFactory = new ChartFactory(
                'svg_' + this.state.instanceId,
                this.state.widgetConfiguration.settings,
                this.state.widgetConfiguration.contextDependent || false,
            );
        }
    }

    private showConfigurationClicked(): void {
        ApplicationService.getInstance().toggleMainDialog('chart-configuration');
    }

    private saveConfiguration(): void {
        this.cancelConfiguration();
        if (this.chartFactory) {
            this.chartFactory.updateConfig(
                this.state.widgetConfiguration.settings,
                this.state.widgetConfiguration.contextDependent || false
            );
            this.drawChart();
        }
    }

    private cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private drawChart(): void {
        const element = document.getElementById('svg_' + this.state.instanceId);
        if (this.chartFactory && element) {
            element.innerHTML = '';
            this.chartFactory.drawChart();
        }
    }
}

module.exports = ChartWidgetComponent;
