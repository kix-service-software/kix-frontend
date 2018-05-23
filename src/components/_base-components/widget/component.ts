import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { BaseWidgetComponentState } from './BaseWidgetComponentState';
import { IdService } from '@kix/core/dist/browser/IdService';
import { WidgetType } from '@kix/core/dist/model';
import { WidgetService } from '@kix/core/dist/browser';

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
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();

        this.state.widgetType = WidgetService.getInstance().getWidgetType(this.state.instanceId, context);

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

    private hasHeaderContent(headerContent: any): boolean {
        return this.isInputDefined(headerContent);
    }

    private isInputDefined(input: any): boolean {
        return input && Boolean(Object.keys(input).length);
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
                case WidgetType.OVERLAY:
                    typeClass = 'overlay-widget';
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

    private closeClicked(): void {
        (this as any).emit('closeWidget');
    }

}

module.exports = WidgetComponent;
