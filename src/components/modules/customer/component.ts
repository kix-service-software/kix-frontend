import { CustomerComponentState } from './model/ComponentState';
import { CustomerState } from './store/State';
import { CUSTOMER_INITIALIZE } from './store/actions';

class CustomerComponent {

    public state: CustomerComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CustomerComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(CUSTOMER_INITIALIZE());
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const reduxState: CustomerState = this.store.getState();
        if (reduxState.containerConfiguration) {
            this.state.containerConfiguration = reduxState.containerConfiguration;
        }
    }
}

module.exports = CustomerComponent;
