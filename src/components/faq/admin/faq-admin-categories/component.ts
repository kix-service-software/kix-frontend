import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        return;
    }

}

module.exports = Component;
