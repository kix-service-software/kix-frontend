import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

}

module.exports = Component;
