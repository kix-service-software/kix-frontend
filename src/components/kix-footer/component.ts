import { FooterComponentState } from './model/FooterComponentState';

class KIXFooterComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = new FooterComponentState();
    }

    public onMount(): void {
        console.log("Mount Footer");
    }
}

module.exports = KIXFooterComponent;
