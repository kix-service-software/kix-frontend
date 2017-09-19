import { KixSidebarConfiguration } from '@kix/core/dist/model/client';
import { KixSidebarComponentState } from './model/KixSidebarComponentState';
import { KixSidebarState } from './store/';
import { KIX_SIDEBAR_INITIALIZE } from './store/actions';

class KIXSidebarComponent {

    public state: KixSidebarComponentState;
    private store: any;

    public onCreate(input: any): void {
        this.state = new KixSidebarComponentState();
        this.state.configurationMode = false;
    }

    public onMount(): void {
        this.store = require('./store/').create();
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(KIX_SIDEBAR_INITIALIZE(this.store));
    }

    public stateChanged(): void {
        const reduxState: KixSidebarState = this.store.getState();
        if (reduxState.configuration) {
            this.state.configuration = reduxState.configuration;
        }
    }

    // function to show/hide given sidebar
    public toggleSidebar(sidebarIndex: number): void {
        if (sidebarIndex === null) {
            return;
        }
        if (this.state.configuration && this.state.configuration.sidebars) {
            this.state.configuration.sidebars[sidebarIndex].show =
                !this.state.configuration.sidebars[sidebarIndex].show;
            this.state.configuration = { ...this.state.configuration };
        }
    }

    public configurationClicked(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }
}

module.exports = KIXSidebarComponent;
