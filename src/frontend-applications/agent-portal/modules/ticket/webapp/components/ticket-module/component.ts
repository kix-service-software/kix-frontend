/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketContext } from '../../core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TicketEvent } from '../../../model/TicketEvent';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState, TicketContext> {

    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Search',
            'Translatable#Help'
        ]);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.filterValue = this.context?.filterValue;

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: async (data: any, eventId: string): Promise<void> => {
                if (eventId === ContextEvents.CONTEXT_USER_WIDGETS_CHANGED) {
                    await this.prepareWidgets();
                } else if (eventId === TicketEvent.MARK_TICKET_AS_SEEN) {
                    setTimeout(async () => {
                        await this.context.reloadObjectList(KIXObjectType.TICKET, true);
                    }, 100);
                }
            }
        };
        this.prepareWidgets();

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_USER_WIDGETS_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(TicketEvent.MARK_TICKET_AS_SEEN, this.subscriber);

    }

    private async prepareWidgets(): Promise<void> {
        this.state.prepared = false;
        setTimeout(async () => {
            this.state.contentWidgets = await this.context.getContent();
            this.state.prepared = true;
        }, 100);
    }

    public keyUp(event: any): void {
        this.state.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        this.context.setFilterValue(this.state.filterValue);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_USER_WIDGETS_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(TicketEvent.MARK_TICKET_AS_SEEN, this.subscriber);
    }

}

module.exports = Component;
