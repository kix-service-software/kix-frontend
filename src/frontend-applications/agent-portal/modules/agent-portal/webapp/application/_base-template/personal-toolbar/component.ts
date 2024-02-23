/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ToolbarAction } from './ToolbarAction';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../base-components/webapp/core/ApplicationEvent';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ActionFactory } from '../../../../../base-components/webapp/core/ActionFactory';
import { ShowUserTicketsAction } from '../../../../../ticket/webapp/core';
import { AuthenticationSocketClient } from '../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { AgentService } from '../../../../../user/webapp/core/AgentService';
import { KIXStyle } from '../../../../../base-components/model/KIXStyle';

class Component {

    public state: ComponentState;

    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: 'personal-toolbar-subscriber',
            eventPublished: (): void => {
                this.initTicketActions();
            }
        };

        const permissions = [new UIComponentPermission('tickets', [CRUD.READ])];
        if (await AuthenticationSocketClient.getInstance().checkPermissions(permissions)) {
            this.state.showTicketActions = true;
            this.initTicketActions();

            EventService.getInstance().subscribe(ApplicationEvent.REFRESH_TOOLBAR, this.subscriber);
        }

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();
    }


    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
        if (this.subscriber) {
            EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
            EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
            EventService.getInstance().unsubscribe(ApplicationEvent.REFRESH_TOOLBAR, this.subscriber);
        }
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
    }

    private async initTicketActions(): Promise<void> {
        const counter = await AgentService.getInstance().getCounter();
        const ticketCounter = counter?.Ticket;

        this.state.ownedTicketsCount = ticketCounter?.Owned || 0;

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Personal Kanban Board', 'Translatable#Personal Ticket Calendar'
        ]);

        const myTicketsNewArticles = await TranslationService.translate('Translatable#My tickets with new articles');
        const myTickets = await TranslationService.translate('Translatable#My Tickets');
        const myWatchedTicketsNewArticles = await TranslationService.translate(
            'Translatable#My watched tickets with new articles'
        );
        const myWatchedTickets = await TranslationService.translate('Translatable#My watched tickets');
        const myLockedTicketsNewArticles = await TranslationService.translate(
            'Translatable#My locked tickets with new articles'
        );
        const myLockedTickets = await TranslationService.translate('Translatable#My locked tickets');

        const actionId = 'show-user-tickets';

        this.state.toolbarGroups = [];

        if (ActionFactory.getInstance().hasAction(actionId)) {
            const group1 = [];
            const group2 = [];
            const group3 = [];

            group1.push(new ToolbarAction(
                'kix-icon-man', myTicketsNewArticles, true, ticketCounter?.OwnedAndUnseen || 0, actionId,
                'OwnedAndUnseen'
            ));
            group1.push(new ToolbarAction(
                'kix-icon-man', myTickets, false, ticketCounter?.Owned || 0, actionId, 'Owned'
            ));

            group2.push(new ToolbarAction(
                'kix-icon-eye', myWatchedTicketsNewArticles, true, ticketCounter?.WatchedAndUnseen || 0,
                actionId, 'WatchedAndUnseen'
            ));
            group2.push(new ToolbarAction(
                'kix-icon-eye', myWatchedTickets, false, ticketCounter?.Watched || 0, actionId,
                'Watched'
            ));

            group3.push(new ToolbarAction(
                'kix-icon-lock-close', myLockedTicketsNewArticles, true, ticketCounter?.OwnedAndLockedAndUnseen || 0,
                actionId, 'OwnedAndLockedAndUnseen'
            ));
            group3.push(new ToolbarAction(
                'kix-icon-lock-close', myLockedTickets, false, ticketCounter?.OwnedAndLocked || 0, actionId,
                'OwnedAndLocked'
            ));
            ContextService.getInstance().registerToolbarActions([...group1, ...group2, ...group3]);
            this.state.toolbarGroups = [group1, group2, group3];
        }
    }

    public async actionClicked(action: ToolbarAction): Promise<void> {
        const actions = await ActionFactory.getInstance().generateActions([action.actionId], action.actionData);
        if (actions && actions.length) {
            const showTicketsAction = actions[0] as ShowUserTicketsAction;
            showTicketsAction.setText(action.title);
            showTicketsAction.icon = action.icon;
            showTicketsAction.run();
        }
    }

    public showCalendar(): void {
        ContextService.getInstance().setActiveContext('calendar');
    }

    public showKanban(): void {
        ContextService.getInstance().setActiveContext('kanban');
    }
}

module.exports = Component;
