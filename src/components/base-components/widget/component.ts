class WidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            minimized: false
        };
    }

    public minimizeWidget(): void {
        this.state.minimized = !this.state.minimized;
    }

}

module.exports = WidgetComponent;
