import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

}

module.exports = Component;
