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

    protected showConfiguration(): void {
        (this as any).emit('showConfiguration');
    }

}

module.exports = WidgetComponent;
