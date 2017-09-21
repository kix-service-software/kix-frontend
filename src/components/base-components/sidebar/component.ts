import { SidebarComponentState } from './model/SidebarComponentState';
import { SidebarState } from './store/SidebarState';
import { SIDEBAR_INITIALIZE } from './store/actions';

class SidebarComponent {

    public state: any;
    public store: any;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
        this.state.sidebar = input.sidebar;
    }

    public onInput(input: any): void {
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        this.store = require('./store').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(SIDEBAR_INITIALIZE(this.state.sidebar.id, this.store));

        this.state.template = require(this.state.sidebar.template);
    }

    public stateChanged(): void {
        const reduxState: SidebarState = this.store.getState();
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
        const reduxState: SidebarState = this.store.getState();
        reduxState.socketlListener.saveConfiguration(configuration);
    }

    public closeConfigurationOverlay(): void {
        this.state.showConfiguration = false;
    }

}

module.exports = SidebarComponent;
