/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ToolbarAction } from './ToolbarAction';
import { EventService } from '../../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { ActionFactory } from '../../../../../../modules/base-components/webapp/core/ActionFactory';
import { AgentService } from '../../../../../user/webapp/core';
import { ShowUserTicketsAction } from '../../../../../ticket/webapp/core';
import { RoutingService } from '../../../../../base-components/webapp/core/RoutingService';
import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../../model/ContextMode';
import { AuthenticationSocketClient } from '../../../../../base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../../server/model/rest/CRUD';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const permissions = [new UIComponentPermission('tickets', [CRUD.READ])];
        if (await AuthenticationSocketClient.getInstance().checkPermissions(permissions)) {
            this.state.showKanban = true;
            this.initActions();
        }

        EventService.getInstance().subscribe(ApplicationEvent.REFRESH_TOOLBAR, {
            eventSubscriberId: 'app-toolbar-subscriber',
            eventPublished: () => {
                this.initActions();
            }
        });
    }

    private async initActions(): Promise<void> {
        const user = await AgentService.getInstance().getCurrentUser(false);
        this.state.ownedTicketsCount = user.Tickets.Owned.length;

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

            setTimeout(() => this.state.toolbarGroups = [group1, group2, group3], 50);
        }
    }

    public async actionClicked(action: ToolbarAction): Promise<void> {
        const actions = await ActionFactory.getInstance().generateActions([action.actionId], action.actionData);
        if (actions && actions.length) {
            const showTicketsAction = actions[0] as ShowUserTicketsAction;
            showTicketsAction.setText(action.title);
            showTicketsAction.run();
        }
    }

    public showKanban(): void {
        const routingCOnfiguration = new RoutingConfiguration('kanban', KIXObjectType.ANY, ContextMode.DASHBOARD, null);
        RoutingService.getInstance().routeToContext(routingCOnfiguration, null);
    }

}

module.exports = Component;
