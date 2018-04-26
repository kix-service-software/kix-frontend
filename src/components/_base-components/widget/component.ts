import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { BaseWidgetComponentState } from './BaseWidgetComponentState';
import { IdService } from '@kix/core/dist/browser/IdService';
import { ContextNotification } from '@kix/core/dist/browser/context';
import { WidgetType } from '@kix/core/dist/model';

class WidgetComponent {

    private state: BaseWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new BaseWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId ? input.instanceId : IdService.generateDateBasedId();
        this.state.configurationTagId = input.configurationTagId;
        this.state.explorer = input.explorer;
        this.state.hasConfigOverlay = typeof input.hasConfigOverlay !== 'undefined' ? input.hasConfigOverlay : false;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
        this.state.closable = typeof input.closable !== 'undefined' ? input.closable : false;
        this.state.isLoading = typeof input.isLoading !== 'undefined' ? input.isLoading : false;
        this.state.isDialog = typeof input.isDialog !== 'undefined' ? input.isDialog : false;

        if (this.isOverlayWidget()) {
            this.state.closable = true;
        }
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();

        this.state.widgetType = context.getWidgetType(this.state.instanceId);

        const config = context.getWidgetConfiguration(this.state.instanceId);
        this.state.widgetConfiguration = config;

        if (config) {
            if (this.state.widgetType === WidgetType.SIDEBAR) {
                this.state.minimizable = false;
                this.state.minimized = false;
            } else {
                this.state.minimizable = config.minimizable;
                this.state.minimized = config.minimized;
            }
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
                // ContextService.getInstance().getContext().toggleExplorer();
            } else {
                this.state.minimized = !this.state.minimized;
            }
        }
    }

    private minimizeExplorer(): void {
        ContextService.getInstance().getContext().toggleExplorerBar();
    }

    private resetConfiguration(): void {
        this.state.configChanged = false;
    }

    private isConfigMode(): boolean {
        return ApplicationService.getInstance().isConfigurationMode();
    }

    private hasHeaderContent(headerContent: any): boolean {
        // TODO: ConfigMode blendet nur Filter aus, aber wahrscheinlich nicht den anderen "HeaderContent"
        return this.isInputDefined(headerContent) && !this.isConfigMode();
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

        if (this.state.widgetType) {
            classes.push(this.getWidgetTypeClass(this.state.widgetType));
        } else {
            classes.push(this.getWidgetTypeClass(this.state.widgetType));
        }

        return classes;
    }

    private getWidgetTypeClass(type: WidgetType): string {
        let typeClass = 'widget-content';

        if (this.state.isDialog) {
            typeClass = "dialog-widget";
        } else {
            switch (type) {
                case WidgetType.DIALOG:
                    typeClass = "dialog-widget";
                    break;
                case WidgetType.OVERLAY_DIALOG:
                    typeClass = 'overlay-dialog-widget';
                    break;
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
                case WidgetType.INFO_OVERLAY:
                    typeClass = 'info-overlay-widget';
                    break;
                case WidgetType.HINT_OVERLAY:
                    typeClass = 'hint-overlay-widget';
                    break;
                case WidgetType.WARNING_OVERLAY:
                    typeClass = 'warning-overlay-widget';
                    break;
                default:
                    typeClass = 'content-widget';
            }
        }

        return typeClass;
    }

    // TODO: ggf. wieder entfernen, wenn Unterscheidung nur noch CSS betrifft (contentActions)
    private isContentWidget(): boolean {
        return this.state.widgetType === WidgetType.CONTENT;
    }

    private isLaneOrLaneTabWidget(): boolean {
        return this.state.widgetType === WidgetType.LANE || this.state.widgetType === WidgetType.LANE_TAB;
    }

    private isOverlayWidget(): boolean {
        return this.state.widgetType === WidgetType.HINT_OVERLAY || this.state.widgetType === WidgetType.INFO_OVERLAY;
    }

    private closeClicked(): void {
        if (this.isOverlayWidget()) {
            ApplicationService.getInstance().toggleOverlay();
        } else {
            (this as any).emit('closeWidget');
        }
    }

}

module.exports = WidgetComponent;
