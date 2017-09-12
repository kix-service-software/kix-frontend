import { WidgetComponentState } from './model/WidgetComponentState';
import { WidgetState } from './store/WidgetState';
import { WIDGET_INITIALIZE } from './store/actions';

class WidgetComponent {

    public state: any;

    public store: any;

    public onCreate(input: any): void {
        this.state = new WidgetComponentState();
        this.state.widget = input.widget;
    }

    public onInput(input: any): void {
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(WIDGET_INITIALIZE(this.state.widget.id, this.store));
    }

    public stateChanged(): void {
        const reduxState: WidgetState = this.store.getState();
        if (reduxState.configuration) {
            this.state.configuration = reduxState.configuration;
        }
    }

    public configClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfigurationOverlay(configuration): void {
        this.state.showConfiguration = false;
        this.state.configuration = configuration;
        const reduxState: WidgetState = this.store.getState();
        reduxState.socketlListener.saveConfiguration(configuration);
    }

    public closeConfigurationOverlay(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = WidgetComponent;
