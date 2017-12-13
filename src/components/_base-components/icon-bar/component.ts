import { IconBarComponentState } from './model/IconBarComponentState';

class IconBar {

    public state: IconBarComponentState;

    public onCreate(input: any): void {
        this.state = new IconBarComponentState();
    }
}

module.exports = IconBar;
