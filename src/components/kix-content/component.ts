declare var io;

class KIXContentComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Content");
    }
}

module.exports = KIXContentComponent;
