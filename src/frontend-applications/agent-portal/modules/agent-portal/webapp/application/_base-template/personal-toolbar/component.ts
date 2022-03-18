/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        const permissions = [new UIComponentPermission('tickets', [CRUD.READ])];
        if (await AuthenticationSocketClient.getInstance().checkPermissions(permissions)) {
            this.state.show = true;
            this.initActions();

            this.subscriber = {
                eventSubscriberId: 'personal-toolbar-subscriber',
                eventPublished: (): void => {
                    this.initActions();
                }
            };

            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
            EventService.getInstance().subscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);
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

    private async initActions(): Promise<void> {
        const user = await AgentService.getInstance().getCurrentUser(false);
        this.state.ownedTicketsCount = user.Tickets.Owned.length;

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
                'kix-icon-man', myTicketsNewArticles, true, user.Tickets.OwnedAndUnseen.length, actionId,
                user.Tickets.OwnedAndUnseen.map((id) => Number(id))
            ));
            group1.push(new ToolbarAction(
                'kix-icon-man', myTickets, false, user.Tickets.Owned.length, actionId, user.Tickets.Owned
            ));

            group2.push(new ToolbarAction(
                'kix-icon-eye', myWatchedTicketsNewArticles, true, user.Tickets.WatchedAndUnseen.length,
                actionId, user.Tickets.WatchedAndUnseen.map((id) => Number(id))
            ));
            group2.push(new ToolbarAction(
                'kix-icon-eye', myWatchedTickets, false, user.Tickets.Watched.length, actionId,
                user.Tickets.Watched.map((id) => Number(id))
            ));

            group3.push(new ToolbarAction(
                'kix-icon-lock-close', myLockedTicketsNewArticles, true, user.Tickets.OwnedAndLockedAndUnseen.length,
                actionId, user.Tickets.OwnedAndLockedAndUnseen.map((id) => Number(id))
            ));
            group3.push(new ToolbarAction(
                'kix-icon-lock-close', myLockedTickets, false, user.Tickets.OwnedAndLocked.length, actionId,
                user.Tickets.OwnedAndLocked.map((id) => Number(id))
            ));

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
