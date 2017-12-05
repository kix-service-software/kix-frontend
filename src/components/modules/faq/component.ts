import { FAQComponentState } from './model/ComponentState';

class FAQComponent {

    public state: FAQComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new FAQComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }
}

module.exports = FAQComponent;
