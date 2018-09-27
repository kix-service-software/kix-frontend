import { ComponentState } from './ComponentState';
import { ToolbarAction } from './ToolbarAction';
import { ActionFactory, ContextService } from '@kix/core/dist/browser';
import { ShowUserTicketsAction } from '@kix/core/dist/browser/ticket';

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
                    'show-user-tickets', user.Tickets.OwnedAndUnseen
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
                    'show-user-tickets', user.Tickets.WatchedAndUnseen
                ),
                new ToolbarAction(
                    'kix-icon-eye', 'Meine beobachteten Tickets', false,
                    user.Tickets.Watched.length,
                    'show-user-tickets', user.Tickets.Watched
                )
            ],
            [
                new ToolbarAction(
                    'kix-icon-close', 'Meine gesperrten Tickets mit neuen Artikeln', true,
                    user.Tickets.OwnedAndLockedAndUnseen.length,
                    'show-user-tickets', user.Tickets.OwnedAndLockedAndUnseen
                ),
                new ToolbarAction(
                    'kix-icon-close', 'Meine gesperrten Tickets', false,
                    user.Tickets.OwnedAndLocked.length,
                    'show-user-tickets', user.Tickets.OwnedAndLocked
                )
            ]
        ]);
    }

    public actionClicked(action: ToolbarAction): void {
        const actions = ActionFactory.getInstance().generateActions([action.actionId], false, action.actionData);
        if (actions && actions.length) {
            const showTicketsAction = actions[0] as ShowUserTicketsAction;
            showTicketsAction.setText(action.title);
            showTicketsAction.run();
        }
    }

}

module.exports = Component;
