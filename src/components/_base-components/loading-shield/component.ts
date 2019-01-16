import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cancelCallback = input.cancelCallback;
        this.state.time = input.time;
    }

    public cancel(): void {
        if (this.state.cancelCallback) {
            this.state.cancelCallback();
            this.state.cancel = true;
        }
    }

}

module.exports = Component;
