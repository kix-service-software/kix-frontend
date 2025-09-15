/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { IdService } from '../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { ContextEvents } from '../../core/ContextEvents';
import { ContextService } from '../../core/ContextService';
import { EventService } from '../../core/EventService';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { KIXModulesService } from '../../core/KIXModulesService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public subscriber: IEventSubscriber;
    private isLeft: boolean;
    private hasSidebars: boolean;

    public onInput(input: any): void {
        this.isLeft = input.isLeft;
    }

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('Sidebar'),
            eventPublished: async (data: any, eventId: string): Promise<void> => {
                if (eventId === ContextEvents.CONTEXT_REMOVED) {
                    const index = this.state.contextList.findIndex((c) => c.instanceId === data?.instanceId);
                    if (index !== -1) {
                        this.state.contextList.splice(index, 1);
                    }
                } else if (eventId === ContextEvents.CONTEXT_CHANGED) {
                    if (!this.state.contextList.some((c) => c.instanceId === data.instanceId)) {
                        this.state.contextList.push(data);
                    }
                } else if (eventId === ApplicationEvent.REFRESH_CONTENT) {
                    this.state.reloadSidebarId = data;

                    setTimeout(() => {
                        this.state.reloadSidebarId = null;
                    }, 25);
                }

                const activeContext = ContextService.getInstance().getActiveContext();

                const sidebars = this.isLeft
                    ? await activeContext?.getSidebarsLeft() || []
                    : await activeContext?.getSidebarsRight() || [];

                this.hasSidebars = sidebars?.length > 0;

                (this as any).setStateDirty('contextList');
            }
        };

        EventService.getInstance().subscribe(ApplicationEvent.REFRESH_CONTENT, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ApplicationEvent.REFRESH_CONTENT, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
    }

    public isActiveContext(instanceId: string): boolean {
        const activeContext = ContextService.getInstance().getActiveContext();
        return activeContext?.instanceId === instanceId && this.hasSidebars;
    }

    public getSidebarTemplate(): any {
        return KIXModulesService.getComponentTemplate('context-sidebar');
    }
}

module.exports = Component;