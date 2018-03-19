import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { BaseWidgetComponentState } from './BaseWidgetComponentState';
import { IdService } from '@kix/core/dist/browser/IdService';
<<<<<<< HEAD
import { ContextNotification } from '@kix/core/dist/browser/context';
=======
import { WidgetType } from '@kix/core/dist/model';
>>>>>>> refs/heads/368-widgetstyling-vereinheitlichen-zentralisieren

class WidgetComponent {

    private state: BaseWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new BaseWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId ? input.instanceId : IdService.generateDateBasedRandomId();
        this.state.configurationTagId = input.configurationTagId;
        this.state.explorer = input.explorer;
        this.state.hasConfigOverlay = input.hasConfigOverlay !== undefined ? input.hasConfigOverlay : false;
<<<<<<< HEAD
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
=======
        this.state.type = input.type;
>>>>>>> refs/heads/368-widgetstyling-vereinheitlichen-zentralisieren
    }

    public onMount(): void {
<<<<<<< HEAD
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const config = ContextService.getInstance().getContext().getWidgetConfiguration(this.state.instanceId);
        if (config) {
            this.state.minimizable = config.minimizable;
            this.state.minimized = config.minimized;
=======
        this.state.widgetConfiguration =
            ContextService.getInstance().getContext().getWidgetConfiguration(this.state.instanceId);
        if (this.state.widgetConfiguration) {
            this.state.minimizable = this.state.widgetConfiguration.minimizable;
            this.state.minimized = this.state.widgetConfiguration.minimized;
>>>>>>> refs/heads/368-widgetstyling-vereinheitlichen-zentralisieren
        }
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.instanceId && type === ContextNotification.TOGGLE_WIDGET) {
            this.state.minimized = args[0];
        }
    }

    private minimizeWidget(): void {
        if (this.state.minimizable) {
            if (this.state.explorer) {
                ContextService.getInstance().toggleExplorer();
            } else {
                this.state.minimized = !this.state.minimized;
            }
        }
    }

    private minimizeExplorer(): void {
        ContextService.getInstance().toggleExplorerBar();
    }

    private showConfiguration(): void {
        if (this.state.configurationTagId) {
            ApplicationStore.getInstance().toggleMainDialog(
                this.state.configurationTagId, { instanceId: this.state.instanceId }
            );
        }
    }

    private resetConfiguration(): void {
        this.state.configChanged = false;
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

    private hasFilter(filter: any): boolean {
        return this.isInputDefined(filter) && !this.isConfigMode();
    }

    private isInputDefined(input: any): boolean {
        return input && Boolean(Object.keys(input).length);
    }

    private hasConfigurationOverlay(): boolean {
        return this.isConfigMode() && this.state.hasConfigOverlay && this.state.configurationTagId !== undefined;
    }

    private getWidgetClasses(): string[] {
        const classes = [];

        if (this.state.minimized) {
            classes.push('minimized');
        }

        if (this.state.widgetConfiguration) {
            classes.push(this.getWidgetTypeClass(this.state.widgetConfiguration.type));
        } else if (this.state.type) {
            classes.push(this.getWidgetTypeClass(this.state.type));
        } else {
            classes.push('content-widget');
        }

        return classes;
    }

    private getWidgetTypeClass(type: WidgetType): string {
        let typeClass = 'widget-content';
        switch (type) {
            case WidgetType.SIDEBAR:
                typeClass = 'sidebar-widget';
                break;
            case WidgetType.LANE:
                typeClass = 'lane-widget';
                break;
            case WidgetType.LANE_TAB:
                typeClass = 'lane-tab-widget';
                break;
            case WidgetType.EXPLORER:
                typeClass = 'explorer-widget';
                break;
            case WidgetType.GROUP:
                typeClass = 'group-widget';
                break;
            default:
                typeClass = 'content-widget';
        }

        return typeClass;
    }

}

module.exports = WidgetComponent;
