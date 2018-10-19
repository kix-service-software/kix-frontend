import { ComponentState } from './ComponentState';

class ActionComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.action = input.action;
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
    }

    public doAction(event: any): void {
        this.state.action.run(event);
    }

}

module.exports = ActionComponent;
