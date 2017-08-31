import { FooterComponentState } from './../../model/client/components';

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
