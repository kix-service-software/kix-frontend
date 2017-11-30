import { SidebarComponentState } from './model/SidebarComponentState';
import { SidebarState } from './store/';
import { SIDEBAR_INITIALIZE } from './store/actions';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { ConfiguredWidget } from '@kix/core/dist/model';

class SidebarComponent {

    public state: SidebarComponentState;
    private store: any;

    public onCreate(input: any): void {
        this.state = new SidebarComponentState();
        if (input.hasOwnProperty('showIconBar') && input.showIconBar === false) {
            this.state.showIconBar = false;
        }
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
        if (this.state.configuration && this.state.configuration.configuredWidgets) {
            const configuredWidget: ConfiguredWidget = this.state.configuration.configuredWidgets.find(
                (cw) => cw[0] === instanceId
            );
            if (configuredWidget) {
                console.log(configuredWidget.instanceId + '---' + configuredWidget.configuration.show);
                configuredWidget.configuration.show = !configuredWidget.configuration.show;
                (this as any).setStateDirty('configuration');
                DashboardStore.getInstance().saveWidgetConfiguration(
                    configuredWidget.configuration.widgetId,
                    configuredWidget.instanceId,
                    configuredWidget.configuration,
                );
            }
        }
    }

    public isShown(instanceId: string): boolean {
        let isShown: boolean = false;
        if (this.state.configuration && this.state.configuration.rows) {
            let instanceIds = [];
            this.state.configuration.rows.forEach((row) => {
                instanceIds = [...instanceIds, ...row];
            });
            isShown = instanceIds.some((wiId) => wiId === instanceId);
        }
        return isShown;
    }

    public toggleConfigurationMode(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }

    public getWidgetTemplate(instanceId: string): any {
        const template = this.state.widgetTemplates.find((wt) => wt.instanceId === instanceId).template;
        return template ? require(template) : '';
    }
}

module.exports = SidebarComponent;
