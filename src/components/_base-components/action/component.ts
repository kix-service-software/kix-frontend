import { ActionComponentState } from './ActionComponentState';

class ActionComponent {

    private state: ActionComponentState;

    public onCreate(): void {
        this.state = new ActionComponentState();
    }

    public onInput(input: any): void {
        this.state.action = input.action;
    }

    private doAction(): void {
        this.state.action.run();
    }

}

module.exports = ActionComponent;
