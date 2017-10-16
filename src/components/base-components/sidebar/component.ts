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
            this.state.widgetTemplates = reduxState.widgetTemplates;
        }
    }

    public toggleSidebarWidget(instanceId: string): void {
        if (this.state.configuration && this.state.configuration.widgets) {
            const widget = this.state.configuration.widgets.find((w) => w.instanceId === instanceId);
            if (widget) {
                widget.show = !widget.show;
                (this as any).setStateDirty('configuration');
            }
        }
    }

    public configurationClicked(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }

    public getWidgetTemplate(widgetId: string): any {
        const template = this.state.widgetTemplates.find((wt) => wt.widgetId === widgetId).template;
        if (template) {
            return require(template);
        }
        return '';
    }
}

module.exports = SidebarComponent;
