/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TicketContext } from '../../core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TicketEvent } from '../../../model/TicketEvent';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState, TicketContext> {

    public onCreate(input: any): void {
        super.onCreate(input, 'ticket-module');
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

        this.prepareWidgets();

        super.registerEventSubscriber(
            async function (data: any, eventId: string): Promise<void> {
                if (eventId === ContextEvents.CONTEXT_USER_WIDGETS_CHANGED) {
                    if (data?.contextId === this.context.contextId) {
                        await this.prepareWidgets();
                    }
                } else if (eventId === TicketEvent.MARK_TICKET_AS_SEEN) {
                    setTimeout(async () => {
                        await this.context.reloadObjectList(KIXObjectType.TICKET, true);
                    }, 100);
                }
            },
            [
                ContextEvents.CONTEXT_USER_WIDGETS_CHANGED,
                TicketEvent.MARK_TICKET_AS_SEEN
            ]
        );

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
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
