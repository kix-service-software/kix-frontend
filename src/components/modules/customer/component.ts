import { CustomerComponentState } from './model/ComponentState';

class CustomerComponent {

    public state: CustomerComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CustomerComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

}

module.exports = CustomerComponent;
