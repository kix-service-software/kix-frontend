class KIXFooterComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            date: new Date().toDateString()
        };
    }

    public onMount(): void {
        console.log("Mount Footer");
    }
}

module.exports = KIXFooterComponent;
