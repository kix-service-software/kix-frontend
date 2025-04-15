/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { ContextType } from '../../../../../../model/ContextType';
import { IdService } from '../../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../../../../base-components/webapp/core/ApplicationEvent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { ContextEvent } from '../../../../../base-components/webapp/core/ContextEvent';
import { ContextEvents } from '../../../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { HomeContext } from '../../../../../home/webapp/core';
import { MobileShowEvent } from '../../../../model/MobileShowEvent';
import { ComponentState } from './ComponentState';
import { ContextTab } from './ContextTab';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.initContextEventListener();
        await this.addContextTabs();
    }

    private async addContextTabs(): Promise<void> {
        const contexts = ContextService.getInstance().getContextInstances();
        for (const c of contexts) {
            await this.addEntry(c);
        }
    }

    private initContextEventListener(): void {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('tabbar-menu-context-event'),
            eventPublished: async (data: Context, eventId: string): Promise<void> => {
                if (eventId === ContextEvents.CONTEXT_CHANGED) {
                    await this.addEntry(data, true);
                } else if (eventId === ContextEvents.CONTEXT_REMOVED) {
                    this.removeEntry(data.instanceId);
                } else if (eventId === ContextEvents.CONTEXT_UPDATE_REQUIRED) {
                    this.setRefreshState(data.instanceId);
                } else if (
                    eventId === ContextEvents.CONTEXT_ICON_CHANGED
                    || eventId === ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED
                    || eventId === ContextEvents.CONTEXT_PARAMETER_CHANGED
                ) {
                    const tab = this.state.contextTabs.find((t) => t.contextInstanceId === data.instanceId);
                    if (tab) {
                        tab.icon = data.getIcon();
                        tab.displayText = await data.getDisplayText();
                    }

                    (this as any).setStateDirty('contextTabs');
                } else if (eventId === ContextEvents.CONTEXT_REORDERED) {
                    this.state.contextTabs = [];
                    this.addContextTabs();
                } else if (eventId === ContextEvent.DISPLAY_VALUE_UPDATED) {
                    const tab = this.state.contextTabs.find((t) => t.contextInstanceId === data.instanceId);
                    const context = ContextService.getInstance().getContext(data.instanceId);
                    tab.displayText = await context.getDisplayText();
                    (this as any).setStateDirty('contextTabs');
                }

            }
        };
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_CREATED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_UPDATE_REQUIRED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_UPDATE_REQUIRED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_ICON_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_REORDERED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvent.DISPLAY_VALUE_UPDATED, this.subscriber);

    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CREATED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_UPDATE_REQUIRED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_UPDATE_REQUIRED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_ICON_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_DISPLAY_TEXT_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_REORDERED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvent.DISPLAY_VALUE_UPDATED, this.subscriber);
    }

    private toggleActiveEntry(): void {
        const context = ContextService.getInstance().getActiveContext();
        this.state.contextTabs.forEach((e) => e.active = context?.instanceId === e.contextInstanceId);
        this.state.contextTabs = [...this.state.contextTabs];
        this.scrollIntoView(context?.instanceId);
    }

    private async addEntry(context: Context, setActive: boolean = false): Promise<void> {
        // make sure it is really a context
        if (context?.contextId) {

            const hasTab = this.state.contextTabs.some((e) => e.contextInstanceId === context.instanceId);

            if (!hasTab) {
                const tab = new ContextTab(
                    null, null, context.instanceId, context.getObjectId(), context.descriptor
                );

                const index = ContextService.getInstance().getContextInstances().findIndex(
                    (c) => c.instanceId === tab.contextInstanceId
                );
                this.state.contextTabs.splice(index, 0, tab);

                tab.icon = context.getIcon();
                tab.displayText = await context.getDisplayText();

                tab.isDialog = context.descriptor?.contextType === ContextType.DIALOG;
                tab.active = ContextService.getInstance().getActiveContext()?.instanceId === context.instanceId;
                tab.pinned = await ContextService.getInstance().isContextStored(context.instanceId);

                (this as any).setStateDirty('contextTabs');
            }

            if (setActive) {
                this.toggleActiveEntry();
            }
        }
    }

    public tabClicked(tab: ContextTab, event: any): void {
        if (!tab.active && !this.state.blocked) {
            tab.refresh = false;
            ContextService.getInstance().setContextByInstanceId(tab.contextInstanceId);
        }
    }

    public canClose(): boolean {
        const instances = ContextService.getInstance().getContextInstances();
        let isHomeContext: boolean = false;
        if (instances.length === 1) {
            isHomeContext = instances[0].contextId === HomeContext.CONTEXT_ID;
        }
        return instances.length > 1 || !isHomeContext;
    }

    public async closeTabWithMMB(tab: ContextTab, event: any): Promise<void> {
        if (event.button !== 1) return;
        await this.closeTab(tab, event);
    }

    public async closeTab(tab: ContextTab, event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        this.state.blocked = true;

        const context = ContextService.getInstance().getActiveContext();

        const switchToTarget = context?.instanceId === tab.contextInstanceId;
        const removed = await ContextService.getInstance().removeContext(
            tab.contextInstanceId, null, null, switchToTarget, false
        );
        this.state.blocked = false;
        if (removed) {
            this.removeEntry(tab.contextInstanceId);
        }
    }

    public async closeAllTabs(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        EventService.getInstance().publish(MobileShowEvent.CLOSE_ALL_TABS_MOBILE);

        this.state.blocked = true;

        let question = 'Translatable#All open tabs will be closed. Continue?';

        // check for open dialogs
        if (this.state.contextTabs.find((tab) => tab.isDialog)) {
            question = 'Translatable#There are open dialogs. Any data you may have entered will be lost. Continue?';
        }

        const confirmed = await new Promise(async (resolve, reject) => {
            BrowserUtil.openConfirmOverlay(
                'Translatable#Close all open tabs',
                question,
                () => resolve(true),
                () => resolve(false),
                ['Translatable#Yes', 'Translatable#No'],
                false
            );
        });

        if (confirmed) {
            await ContextService.getInstance().removeAllContexts(true);
        }

        this.state.blocked = false;
    }

    private removeEntry(contextInstanceId: string): void {
        const index = this.state.contextTabs.findIndex((e) => e.contextInstanceId === contextInstanceId);
        if (index !== -1) {
            this.state.contextTabs.splice(index, 1);
            (this as any).setStateDirty('contextTabs');
        }
    }

    private setRefreshState(contextInstanceId: string): void {
        this.state.contextTabs.forEach((e) => {
            if (e.contextInstanceId === contextInstanceId) {
                e.refresh = true;
            }
        });
        (this as any).setStateDirty('contextTabs');
    }

    public refreshTab(tab: ContextTab): void {
        tab.refresh = false;
        EventService.getInstance().publish(ApplicationEvent.REFRESH_CONTENT);
        (this as any).setStateDirty('contextTabs');
    }

    public async tabDblClicked(tab: ContextTab): Promise<void> {
        if (!this.state.blocked) {
            this.state.blocked = true;
            const success = await ContextService.getInstance().updateStorage(tab.contextInstanceId, tab.pinned);
            if (success) {
                tab.pinned = !tab.pinned;
            }
            (this as any).setStateDirty('contextTabs');
            this.state.blocked = false;
        }
    }

    public scrollTabs(left: boolean): void {
        const element: HTMLElement = (this as any).getEl('tabbar-tab-content');
        if (element) {
            if (left) {
                element.scrollLeft -= 300;
            }
            else {
                element.scrollLeft += 300;
            }
        }
    }

    private scrollIntoView(instanceId: string): void {
        const tabContent: HTMLElement = (this as any).getEl('tabbar-tab-content');
        const tabElement: HTMLElement = (this as any).getEl(instanceId);

        if (tabContent && tabElement) {
            tabContent.scrollLeft = tabElement.offsetLeft - 50;
        }
    }

    public drag(tab: ContextTab, event: any): void {
        event.dataTransfer.setData('text', tab.contextInstanceId);
    }

    public dragOver(tab: ContextTab, event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.dragOverInstanceId = tab.contextInstanceId;
    }

    public drop(tab: ContextTab, event: any): void {
        event.stopPropagation();
        event.preventDefault();
        const sourceInstanceId = event.dataTransfer.getData('text');
        ContextService.getInstance().reorderContext(sourceInstanceId, tab.contextInstanceId);
        this.state.dragOverInstanceId = null;
    }
}

module.exports = Component;
