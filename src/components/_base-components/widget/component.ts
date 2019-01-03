import { ContextService } from '../../../core/browser/context/ContextService';
import { ComponentState } from './ComponentState';
import { IdService } from '../../../core/browser/IdService';
import { WidgetType } from '../../../core/model';
import { WidgetService } from '../../../core/browser';
import { IEventListener, EventService } from '../../../core/browser/event';

class WidgetComponent implements IEventListener {

    private state: ComponentState;
    public eventSubscriberId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.instanceId = input.instanceId ? input.instanceId : IdService.generateDateBasedId();
        this.state.explorer = input.explorer;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
        this.state.closable = typeof input.closable !== 'undefined' ? input.closable : false;
        this.state.isDialog = typeof input.isDialog !== 'undefined' ? input.isDialog : false;
        this.state.contextType = input.contextType;
        this.eventSubscriberId = typeof input.eventSubscriberPrefix !== 'undefined'
            ? input.eventSubscriberPrefix
            : 'GeneralWidget';
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);

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

        // TODO: Enum für events nutzen (ohne Prefix), falls es mehrer geben sollte
        EventService.getInstance().subscribe(this.eventSubscriberId + 'SetMinimizedToFalse', this);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(this.eventSubscriberId + 'SetMinimizedToFalse', this);
    }

    public minimizeWidget(force: boolean = false, event: any): void {
        if (event && event.preventDefault) {
            event.preventDefault(event);
        }

        if (this.state.minimizable) {
            if (
                force
                || (
                    (event.target.tagName === 'DIV'
                        || event.target.tagName === 'SPAN'
                        || event.target.tagName === 'UL')
                    && (event.target.classList.contains('widget-header')
                        || event.target.classList.contains('header-left')
                        || event.target.classList.contains('header-right')
                        || event.target.classList.contains('tab-list'))
                )
            ) {
                this.state.minimized = !this.state.minimized;
                (this as any).emit('minimizedChanged', this.state.minimized);
            }
        }
    }

    public setMinizedState(state: boolean = false): void {
        if (this.state.minimized !== state) {
            this.minimizeWidget(true, null);
        }
    }

    public minimizeExplorer(): void {
        ContextService.getInstance().getActiveContext(this.state.contextType).toggleExplorerBar();
    }

    public hasHeaderContent(headerContent: any): boolean {
        return this.isInputDefined(headerContent);
    }

    private isInputDefined(input: any): boolean {
        return input && Boolean(Object.keys(input).length);
    }

    public getWidgetClasses(): string[] {
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
    public isContentWidget(): boolean {
        return this.state.widgetType === WidgetType.CONTENT;
    }

    public isLaneWidget(): boolean {
        return this.state.widgetType === WidgetType.LANE;
    }

    public closeClicked(): void {
        (this as any).emit('closeWidget');
    }

    public eventPublished(data: any, eventId: string): void {
        if (eventId === (this.eventSubscriberId + 'SetMinimizedToFalse')) {
            this.state.minimized = false;
        }
    }

    public headerMousedown(force: boolean = false, event: any): void {
        if (
            force
            || (
                (event.target.tagName === 'DIV'
                    || event.target.tagName === 'SPAN'
                    || event.target.tagName === 'UL')
                && (event.target.classList.contains('widget-header')
                    || event.target.classList.contains('header-left')
                    || event.target.classList.contains('header-right')
                    || event.target.classList.contains('tab-list'))
            )
        ) {
            (this as any).emit('headerMousedown', event);
        }
    }

    public getWidgetTypeActionDisplaySetting(): boolean {
        return (
            this.state.widgetType === WidgetType.SIDEBAR
            || this.state.widgetType === WidgetType.EXPLORER
            || this.state.widgetType === WidgetType.OVERLAY
        ) ? false : true;
    }

    public isSidebarWidget(): boolean {
        return this.state.widgetType === WidgetType.SIDEBAR;
    }

}

module.exports = WidgetComponent;
