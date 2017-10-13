import { ChartReduxState } from './store/ChartReduxState';
import { ChartFactory, ChartConfiguration, WidgetBaseComponent } from '@kix/core/dist/model/client';
import { ChartComponentState } from './model/ChartComponentState';
import { CHARTS_INITIALIZE } from './store/actions';

class ChartWidgetComponent extends WidgetBaseComponent<ChartComponentState, ChartReduxState> {

    private componentInititalized: boolean = false;

    public onCreate(input: any): void {
        this.state = new ChartComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(CHARTS_INITIALIZE(this.store, 'chart-widget', this.state.instanceId));
    }

    public stateChanged(): void {
        super.stateChanged();

        const reduxState: ChartReduxState = this.store.getState();

        if (!this.componentInititalized && reduxState.widgetConfiguration) {
            this.drawChart();
            this.componentInititalized = true;
        }
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
        this.drawChart();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    private drawChart(): void {
        // remove chart and add new with changed configuration
        console.log("DrawChart: " + this.state.svgId);
        const element = document.getElementById(this.state.svgId);
        if (element && this.state.widgetConfiguration) {
            element.innerHTML = '';
            ChartFactory.createChart(this.state.svgId, this.state.widgetConfiguration.contentConfiguration);
        }
    }
}

module.exports = ChartWidgetComponent;
