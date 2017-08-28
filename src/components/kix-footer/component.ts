import { FooterComponentState } from './../../model-client/footer';

class KIXFooterComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = FooterComponentState;
        console.log(this.state);
    }

    public onMount(): void {
        console.log("Mount Footer");
    }
}

module.exports = KIXFooterComponent;
