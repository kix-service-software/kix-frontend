import { FooterComponentState } from './model/FooterComponentState';

class KIXFooterComponent {

    public state: FooterComponentState;

    public onCreate(input: any): void {
        this.state = new FooterComponentState();
    }

}

module.exports = KIXFooterComponent;
