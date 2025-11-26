/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { IdService } from '../../../../../model/IdService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';
import { ActionFactory } from '../../core/ActionFactory';
import { BrowserUtil } from '../../core/BrowserUtil';
import { ClientStorageService } from '../../core/ClientStorageService';
import { IAction } from '../../core/IAction';
import { TabContainerEvent } from '../../core/TabContainerEvent';
import { TabContainerEventData } from '../../core/TabContainerEventData';
import { ComponentState } from './ComponentState';

class WidgetComponent extends AbstractMarkoComponent<ComponentState> {

    private clearMinimizedStateOnDestroy: boolean;
    private additionalActions: IAction[] = [];

    public onCreate(input: any): void {
        super.onCreate(input, 'widget');
        this.state = new ComponentState();
        this.clearMinimizedStateOnDestroy = input.clearMinimizedStateOnDestroy || false;
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId ? input.instanceId : IdService.generateDateBasedId();

        this.state.widgetConfiguration = input.configuration;

        this.state.minimizable = typeof input.minimizable !== 'undefined'
            ? input.minimizable
            : this.state.minimizable;

        this.state.closable = typeof input.closable !== 'undefined' ? input.closable : false;
        this.state.contextType = input.contextType;
        if (input.title) {
            this.setTitle(input.title);
        }

        this.prepareActions(input?.actions);
    }

    private async setTitle(title: string): Promise<void> {
        this.state.title = await TranslationService.translate(title);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        if (this.context) {
            this.state.widgetType = this.context.widgetService.getWidgetType(this.state.instanceId, this.context);
        }
        else {
            this.state.widgetType = WidgetService.getInstance().getWidgetType(this.state.instanceId, this.context);
        }

        // set before config (prevent await delay)
        if (this.state.widgetType === WidgetType.SIDEBAR) {
            this.state.minimized = !this.context?.isSidebarWidgetOpen(this.state.instanceId);
        }

        if (!this.state.widgetConfiguration) {
            const config = await this.context?.getWidgetConfiguration(this.state.instanceId);
            this.state.widgetConfiguration = config;
        }

        if (this.state.widgetType !== WidgetType.SIDEBAR && this.state.widgetConfiguration) {
            this.state.minimized = this.state.widgetConfiguration?.minimized;
        }

        const storedMinimized = ClientStorageService.getOption(`${this.state.instanceId}-minimized`);
        if (typeof storedMinimized !== 'undefined' && storedMinimized !== null) {
            this.state.minimized = storedMinimized === 'true';
        }
        this.additionalActions = await ActionFactory.getInstance().getActionsForWidget(
            this.state.widgetConfiguration?.widgetId, this.contextInstanceId
        );
        this.prepareActions(this.state.actions);

        super.registerEventSubscriber(
            async function (data: TabContainerEventData, eventId: string): Promise<void> {
                if (data.tabId === this.state.instanceId) {
                    this.setTitle(data.title);
                }
            },
            [TabContainerEvent.CHANGE_TITLE]
        );
    }

    public onDestroy(): void {
        super.onDestroy();
        if (this.clearMinimizedStateOnDestroy) {
            ClientStorageService.deleteState(`${this.state.instanceId}-minimized`);
        }
    }

    private canChangeMinimize = true;
    public async minimizeWidget(force: boolean = false, event: any): Promise<void> {
        if (!this.canChangeMinimize) {
            this.canChangeMinimize = true;
            if (!force) {
                return;
            }
        }
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (this.state.minimizable && (!await BrowserUtil.isTextSelected() || !event)) {
            if (
                force
                || (
                    (event?.target.tagName === 'DIV'
                        || event.target.tagName === 'SPAN'
                        || event.target.tagName === 'UL')
                    && (event?.target.classList.contains('widget-header')
                        || event.target.classList.contains('header-left')
                        || event.target.classList.contains('header-right')
                        || event.target.classList.contains('tab-list'))
                )
            ) {
                this.state.minimized = !this.state.minimized;
                (this as any).emit('minimizedChanged', this.state.minimized);
                if (this.state.widgetType === WidgetType.SIDEBAR) {
                    this.context?.toggleSidebarWidget(this.state.instanceId);
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

    public doNotChangeMinimize(): void {
        this.canChangeMinimize = false;
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

        if (this.context) {
            classes.push(this.context.widgetService.getWidgetClasses(this.state.instanceId));
        }
        else {
            classes.push(WidgetService.getInstance().getWidgetClasses(this.state.instanceId));
        }

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
        return (!(this.state.widgetType === WidgetType.SIDEBAR
            || this.state.widgetType === WidgetType.OVERLAY));
    }

    public isSidebarWidget(): boolean {
        return this.state.widgetType === WidgetType.SIDEBAR;
    }

    private prepareActions(actions: IAction[] = []): void {
        this.state.actions = [...actions, ...this.additionalActions || []];
    }

}

module.exports = WidgetComponent;
