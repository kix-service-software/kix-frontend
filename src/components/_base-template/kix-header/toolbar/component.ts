import { ComponentState } from './ComponentState';
import { ToolbarAction } from './ToolbarAction';
import { ActionFactory, ContextService } from '../../../../core/browser';
import { ShowUserTicketsAction } from '../../../../core/browser/ticket';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        const objectData = ContextService.getInstance().getObjectData();
        const user = objectData.currentUser;
        this.state = new ComponentState([
            [
                new ToolbarAction(
                    'kix-icon-man', 'Meine Tickets mit neuen Artikeln', true,
                    user.Tickets.OwnedAndUnseen.length,
                    'show-user-tickets', user.Tickets.OwnedAndUnseen.map((id) => Number(id))
                ),
                new ToolbarAction(
                    'kix-icon-man', 'Meine Tickets', false,
                    user.Tickets.Owned.length,
                    'show-user-tickets', user.Tickets.Owned
                )
            ],
            [
                new ToolbarAction(
                    'kix-icon-eye', 'Meine beobachteten Tickets mit neuen Artikeln', true,
                    user.Tickets.WatchedAndUnseen.length,
                    'show-user-tickets', user.Tickets.WatchedAndUnseen.map((id) => Number(id))
                ),
                new ToolbarAction(
                    'kix-icon-eye', 'Meine beobachteten Tickets', false,
                    user.Tickets.Watched.length,
                    'show-user-tickets', user.Tickets.Watched.map((id) => Number(id))
                )
            ],
            [
                new ToolbarAction(
                    'kix-icon-lock-close', 'Meine gesperrten Tickets mit neuen Artikeln', true,
                    user.Tickets.OwnedAndLockedAndUnseen.length,
                    'show-user-tickets', user.Tickets.OwnedAndLockedAndUnseen.map((id) => Number(id))
                ),
                new ToolbarAction(
                    'kix-icon-lock-close', 'Meine gesperrten Tickets', false,
                    user.Tickets.OwnedAndLocked.length,
                    'show-user-tickets', user.Tickets.OwnedAndLocked.map((id) => Number(id))
                )
            ]
        ]);
    }

    public actionClicked(action: ToolbarAction): void {
        const actions = ActionFactory.getInstance().generateActions([action.actionId], action.actionData);
        if (actions && actions.length) {
            const showTicketsAction = actions[0] as ShowUserTicketsAction;
            showTicketsAction.setText(action.title);
            showTicketsAction.run();
        }
    }

}

module.exports = Component;
