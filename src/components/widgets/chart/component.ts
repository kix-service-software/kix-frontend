import { ChartFactory } from '@kix/core/dist/browser/model/charts';
import { ChartComponentState } from './model/ChartComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

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
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);
        if (this.state.widgetConfiguration && this.state.widgetConfiguration.settings) {
            this.chartFactory = new ChartFactory(
                'svg_' + this.state.instanceId,
                this.state.widgetConfiguration.settings,
                this.state.widgetConfiguration.contextDependent || false,
            );

            this.drawChart();
        }
    }

    private showConfigurationClicked(): void {
        ApplicationStore.getInstance().toggleDialog('chart-configuration');
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

    private redrawChart(minimized: boolean = false): void {
        if (!minimized) {
            this.drawChart();
        }
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
