import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

}

module.exports = Component;
