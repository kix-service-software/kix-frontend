import { SidebarComponentState } from './model/SidebarComponentState';
import { SidebarState } from './store/';
import { SIDEBAR_INITIALIZE } from './store/actions';

class SidebarComponent {

    public state: SidebarComponentState;
    private store: any;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
        this.state.configurationMode = false;
    }

    public onMount(): void {
        this.store = require('./store/').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(SIDEBAR_INITIALIZE(this.store));
    }

    public stateChanged(): void {
        const reduxState: SidebarState = this.store.getState();
        if (reduxState.configuration) {
            this.state.configuration = reduxState.configuration;
        }
    }

    public toggleSidebarWidget(sidebarWidgetIndex: number): void {
        if (sidebarWidgetIndex === null) {
            return;
        }
        console.log(sidebarWidgetIndex);
        console.log(this.state.configuration);
        if (this.state.configuration && this.state.configuration.widgets) {

            this.state.configuration.widgets[sidebarWidgetIndex].show =
                !this.state.configuration.widgets[sidebarWidgetIndex].show;
            // this.state.configuration = { ...this.state.configuration };
            (this as any).setStateDirty('configuration');
        }
    }

    public configurationClicked(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }
}

module.exports = SidebarComponent;
