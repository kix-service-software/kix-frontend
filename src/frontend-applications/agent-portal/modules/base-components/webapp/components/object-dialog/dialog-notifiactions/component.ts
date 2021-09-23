/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from 'mocha';
import { IdService } from '../../../../../../model/IdService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../core/AbstractMarkoComponent';
import { ContextEvents } from '../../../core/ContextEvents';
import { EventService } from '../../../core/EventService';
import { IEventSubscriber } from '../../../core/IEventSubscriber';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: async (data: Context, eventId: string): Promise<void> => {
                if (eventId === ContextEvents.CONTEXT_STORED) {
                    this.state.message = await TranslationService.translate('Translatable#draft successfully saved');
                    setTimeout(() => this.state.message = null, 3000);
                }
            }
        };
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_STORED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_STORED, this.subscriber);
    }

}

module.exports = Component;
