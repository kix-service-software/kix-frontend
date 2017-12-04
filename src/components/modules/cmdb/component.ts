import { CMDBComponentState } from './model/ComponentState';

class CMDBComponent {

    public state: CMDBComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CMDBComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

}

module.exports = CMDBComponent;
