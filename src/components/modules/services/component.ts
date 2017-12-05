import { ServicesComponentState } from './model/ComponentState';

class ServicesComponent {

    public state: ServicesComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new ServicesComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

}

module.exports = ServicesComponent;
