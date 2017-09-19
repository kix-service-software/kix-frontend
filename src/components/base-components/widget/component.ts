import { WidgetConfiguration } from '@kix/core/dist/model/client';
import { WidgetComponentState } from './model/WidgetComponentState';
import { WidgetState } from './store/WidgetState';
import { WIDGET_INITIALIZE } from './store/actions';

class WidgetComponent {

    public state: WidgetComponentState;

    public store: any;

    private updateContentConfigurationHandler: any;

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
            this.state.actions = reduxState.configuration.actions;
            this.state.contentConfiguration = reduxState.configuration.contentConfiguation;
        }
    }

    public contentDataLoaded(contentData: any): void {
        this.state.contentData = contentData;
    }

    public onUpdateContentConfigurationHandler(handler: any): void {
        this.updateContentConfigurationHandler = handler;
    }

    public configClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfigurationOverlay(configuration): void {
        this.state.showConfiguration = false;
        this.state.contentConfiguration = configuration;
        const reduxState: WidgetState = this.store.getState();
        reduxState.socketlListener
            .saveConfiguration(new WidgetConfiguration(this.state.actions, this.state.contentConfiguration));

        if (this.updateContentConfigurationHandler) {
            this.updateContentConfigurationHandler(this.state.contentConfiguration);
        }
    }

    public closeConfigurationOverlay(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = WidgetComponent;
