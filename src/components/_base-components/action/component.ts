import { ActionComponentState } from './ActionComponentState';

class ActionComponent {

    private state: ActionComponentState;

    public onCreate(): void {
        this.state = new ActionComponentState();
    }

    public onInput(input: any): void {
        this.state.action = input.action;
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : undefined;
    }

    private isDisplayText(): boolean {
        if (typeof this.state.displayText !== 'undefined') {
            return this.state.displayText;
        } else {
            return this.state.action.displayText;
        }
    }

    private doAction(): void {
        this.state.action.run();
    }

}

module.exports = ActionComponent;
