/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from './AbstractComponentState';
import { Context } from '../../../../model/Context';
import { ContextService } from './ContextService';
import { EventService } from './EventService';
import { IEventSubscriber } from './IEventSubscriber';
import { IdService } from '../../../../../../frontend-applications/agent-portal/model/IdService';
import { IMarkoComponent } from './IMarkoComponent';
import { ObjectFormConfigurationContext } from '../../../object-forms/webapp/core/ObjectFormConfigurationContext';

// eslint-disable-next-line max-len
export abstract class AbstractMarkoComponent<CS extends AbstractComponentState = AbstractComponentState, C extends Context = Context> implements IMarkoComponent<CS, any> {

    private instanceId: string;
    private eventSubscriberPrefix: string;
    private eventSubscriberId: string;
    public state: CS;
    protected context: C;
    protected contextInstanceId: string;

    public onCreate(input: any, eventSubscriberPrefix: string = ''): void {
        this.eventSubscriberPrefix = eventSubscriberPrefix;

        this.instanceId = IdService.generateDateBasedId();

        if (input.contextInstanceId) {
            AbstractMarkoComponent.prototype.setComponentContext.call(
                this,
                ContextService.getInstance().getContext(input.contextInstanceId)
            );
        }

        if (!this.eventSubscriberId) {
            this.eventSubscriberId = this.eventSubscriberPrefix + this.instanceId;
        }

        if (typeof this.prepareMount !== 'function') {
            this.prepareMount = AbstractMarkoComponent.prototype.prepareMount.bind(this);
        }
    }

    public onInput(input: any): void {
        return;
    }

    public async onMount(): Promise<void> {
        if (!this.contextInstanceId) {
            const thisComponent = (this as any).getEl();
            if (thisComponent) {
                const componentContainer = thisComponent.closest('[data-contextinstanceid]');
                if (componentContainer?.dataset?.contextinstanceid) {
                    AbstractMarkoComponent.prototype.setComponentContext.call(
                        this,
                        ContextService.getInstance().getContext(componentContainer.dataset.contextinstanceid)
                    );
                }
            }
        }

        if (!this.context) {
            AbstractMarkoComponent.prototype.setComponentContext.call(
                this, ContextService.getInstance().getActiveContext()
            );
        }

        if (this.state) {
            this.state.isConfigContext = this.context?.contextId === ObjectFormConfigurationContext.CONTEXT_ID;
        }

        await this.prepareMount();
    }

    public onUpdate(): void {
        return;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribeSubscriber(this.eventSubscriberId);
    }

    protected async prepareMount(): Promise<void> {
        return;
    }

    protected setComponentContext(context: C): void {
        if (context?.instanceId !== this.contextInstanceId) {
            const oldEventSubscriberId = this.eventSubscriberId;

            this.context = context;
            this.contextInstanceId = context.instanceId;
            this.eventSubscriberId = this.eventSubscriberPrefix + this.contextInstanceId + '-' + this.instanceId;

            if (oldEventSubscriberId) {
                EventService.getInstance().renameSubscriber(oldEventSubscriberId, this.eventSubscriberId);
            }
        }
    }

    protected registerEventSubscriber(
        eventPublished: (data: any, eventId: string, subscriberId?: string) => void,
        events: string[]
    ): void {
        const eventSubscriber: IEventSubscriber = {
            eventSubscriberId: this.eventSubscriberId,
            eventPublished: eventPublished.bind(this)
        };
        for (let event of events) {
            EventService.getInstance().subscribe(event, eventSubscriber);
        }
    }

    protected getEventSubscriberId(): string {
        return this.eventSubscriberId;
    }
}