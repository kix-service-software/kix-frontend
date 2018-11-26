import { AbstractMarkoComponent } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

}

module.exports = Component;
