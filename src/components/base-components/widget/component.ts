class WidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            minimized: true
        };
    }

    public minimizeWidget(): void {
        this.state.minimized = !this.state.minimized;
    }

}

module.exports = WidgetComponent;
