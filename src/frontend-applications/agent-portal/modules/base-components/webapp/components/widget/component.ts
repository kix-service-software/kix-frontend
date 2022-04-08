/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ClientStorageService } from '../../core/ClientStorageService';
import { TabContainerEvent } from '../../core/TabContainerEvent';
import { TabContainerEventData } from '../../core/TabContainerEventData';
import { BrowserUtil } from '../../core/BrowserUtil';

class WidgetComponent implements IEventSubscriber {

    private state: ComponentState;
    public eventSubscriberId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId ? input.instanceId : IdService.generateDateBasedId();

        this.state.widgetConfiguration = input.configuration;

        this.state.minimizable = typeof input.minimizable !== 'undefined'
            ? input.minimizable
            : this.state.minimizable;

        this.state.closable = typeof input.closable !== 'undefined' ? input.closable : false;
        this.state.contextType = input.contextType;
        this.eventSubscriberId = typeof input.eventSubscriberPrefix !== 'undefined'
            ? input.eventSubscriberPrefix
            : 'GeneralWidget';
        if (input.title) {
            this.setTitle(input.title);
        }
    }

    private async setTitle(title: string): Promise<void> {
        this.state.title = await TranslationService.translate(title);
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        this.state.widgetType = WidgetService.getInstance().getWidgetType(this.state.instanceId, context);

        // set before config (prevent await delay)
        if (this.state.widgetType === WidgetType.SIDEBAR) {
            this.state.minimized = !context.isSidebarWidgetOpen(this.state.instanceId);
        }

        if (!this.state.widgetConfiguration) {
            const config = await context.getWidgetConfiguration(this.state.instanceId);
            this.state.widgetConfiguration = config;
        }

        this.state.minimizable = this.state.widgetConfiguration?.minimizable;
        if (this.state.widgetType !== WidgetType.SIDEBAR) {
            this.state.minimized = this.state.widgetConfiguration?.minimized;
        }

        const storedMinimized = ClientStorageService.getOption(`${this.state.instanceId}-minimized`);
        if (typeof storedMinimized !== 'undefined') {
            this.state.minimized = storedMinimized === 'true';
        }

        EventService.getInstance().subscribe(this.eventSubscriberId + 'SetMinimizedToFalse', this);
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TITLE, this);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(this.eventSubscriberId + 'SetMinimizedToFalse', this);
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_TITLE, this);
    }

    public minimizeWidget(force: boolean = false, event: any): void {
        if (event && event.preventDefault) {
            event.preventDefault();
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
                if (this.state.widgetType === WidgetType.SIDEBAR) {
                    const context = ContextService.getInstance().getActiveContext();
                    if (context) {
                        context.toggleSidebarWidget(this.state.instanceId);
                    }
                }
            }

            if (this.state.minimized) {
                ClientStorageService.setOption(`${this.state.instanceId}-minimized`, this.state.minimized.toString());
            } else {
                setTimeout(() => {
                    const element = (this as any).getEl('widget-content');
                    if (element) {
                        BrowserUtil.scrollIntoViewIfNeeded(element);
                    }
                }, 100);

                ClientStorageService.deleteState(`${this.state.instanceId}-minimized`);
            }
        }
    }

    public setMinizedState(state: boolean = false): void {
        if (this.state.minimized !== state) {
            this.minimizeWidget(true, null);
        }
    }

    public getWidgetClasses(): string[] {
        const classes = [];

        if (this.state.minimized) {
            classes.push('minimized');
        }

        classes.push(this.getWidgetTypeClass(this.state.widgetType));
        classes.push(WidgetService.getInstance().getWidgetClasses(this.state.instanceId));

        return classes;
    }

    private getWidgetTypeClass(type: WidgetType): string {
        let typeClass: string;

        switch (type) {
            case WidgetType.DIALOG:
                typeClass = 'dialog-widget';
                break;
            case WidgetType.SIDEBAR:
                typeClass = 'sidebar-widget';
                break;
            case WidgetType.LANE:
                typeClass = 'lane-widget';
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

    public async eventPublished(data: any, eventId: string): Promise<void> {
        if (eventId === (this.eventSubscriberId + 'SetMinimizedToFalse')) {
            this.state.minimized = false;
        } else if (eventId === TabContainerEvent.CHANGE_TITLE) {
            const changeData: TabContainerEventData = data;
            if (changeData.tabId === this.state.instanceId) {
                this.setTitle(changeData.title);
            }
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
            || this.state.widgetType === WidgetType.OVERLAY
        ) ? false : true;
    }

    public isSidebarWidget(): boolean {
        return this.state.widgetType === WidgetType.SIDEBAR;
    }

}

module.exports = WidgetComponent;
