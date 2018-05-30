import { ComponentState } from "./ComponentState";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.customerId);
    }

}

module.exports = Component;
