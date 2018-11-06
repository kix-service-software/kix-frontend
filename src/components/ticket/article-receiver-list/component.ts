import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.receiverList = input.receiver;
    }

}

module.exports = Component;
