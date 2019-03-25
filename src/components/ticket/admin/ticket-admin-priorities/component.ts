import { AbstractMarkoComponent } from '../../../../core/browser';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

}

module.exports = Component;
