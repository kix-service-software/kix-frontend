import { ReportsComponentState } from './model/ComponentState';

class ReportsComponent {

    public state: ReportsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new ReportsComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

}

module.exports = ReportsComponent;
