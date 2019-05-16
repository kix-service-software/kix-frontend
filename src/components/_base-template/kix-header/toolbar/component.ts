import { ComponentState } from './ComponentState';
import { ToolbarAction } from './ToolbarAction';
import { ActionFactory } from '../../../../core/browser';
import { ShowUserTicketsAction } from '../../../../core/browser/ticket';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { AgentService } from '../../../../core/browser/application/AgentService';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const user = await AgentService.getInstance().getCurrentUser();

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
            showTicketsAction.run();
        }
    }

}

module.exports = Component;
