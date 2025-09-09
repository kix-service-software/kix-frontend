/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { EventService } from '../../core/EventService';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../core/ContextService';
import { ContextEvents } from '../../core/ContextEvents';
import { KIXModulesService } from '../../core/KIXModulesService';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { Context } from '../../../../../model/Context';

export class RouterOutletComponent {

    private state: ComponentState;
    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.routerId = input.id;
    }

    public async onMount(): Promise<void> {

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('RouterOutlet'),
            eventPublished: this.updateContextList.bind(this)
        };
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);

        EventService.getInstance().subscribe(ApplicationEvent.REFRESH_CONTENT, {
            eventSubscriberId: 'BASE-TEMPLATE-REFRESH',
            eventPublished: (reloadContextInstanceId: string, eventId: string): void => {
                this.state.reloadContextInstanceId = reloadContextInstanceId;

                setTimeout(() => {
                    this.state.reloadContextInstanceId = null;
                }, 500);
            }
        });

    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_REMOVED, this.subscriber);
    }

    public updateContextList(data: Context, eventId: string): void {
        if (eventId === ContextEvents.CONTEXT_REMOVED) {
            const index = this.state.contextList.findIndex((c) => c.instanceId === data?.instanceId);
            if (index !== -1) {
                this.state.contextList.splice(index, 1);
            }
        } else {
            this.setContextList(data);
        }

        (this as any).setStateDirty('contextList');
    }

    private setContextList(context: Context): void {
        if (!this.state.contextList.some((c) => c.instanceId === context.instanceId)) {
            const template = KIXModulesService.getComponentTemplate(context.descriptor.componentId);
            if (template) {
                this.state.contextList.push({
                    template,
                    instanceId: context.instanceId,
                    data: { objectId: context.getObjectId() }
                });
            }
        }
    }

    public isActiveContext(instanceId: string): boolean {
        const activeContext = ContextService.getInstance().getActiveContext();
        return activeContext?.instanceId === instanceId;
    }

}

module.exports = RouterOutletComponent;
