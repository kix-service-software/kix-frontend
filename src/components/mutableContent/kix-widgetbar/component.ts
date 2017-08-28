class KIXWidgetbarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Widgetbar");
    }
}

module.exports = KIXWidgetbarComponent;
