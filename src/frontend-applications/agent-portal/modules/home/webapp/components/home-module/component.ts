/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';

class HomeComponent {

    public state: ComponentState;
    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (): void => {
                this.prepareWidgets();
            }
        };
        this.prepareWidgets();

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_USER_WIDGETS_CHANGED, this.subscriber);
    }

    private async prepareWidgets(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.prepared = false;
        setTimeout(async () => {
            this.state.contentWidgets = await context.getContent();
            this.state.prepared = true;
        }, 100);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_USER_WIDGETS_CHANGED, this.subscriber);
    }

}

module.exports = HomeComponent;
