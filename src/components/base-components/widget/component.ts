class WidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            minimized: false,
            configChanged: false
        };
    }

    public minimizeWidget(): void {
        this.state.minimized = !this.state.minimized;
    }

    private showConfiguration(): void {
        (this as any).emit('showConfiguration');
    }

    private resetConfiguration(): void {
        // TODO: hol alten stand aus browser "cache" und überschreib neue konfiguration
        this.state.configChanged = false;
    }

}

module.exports = WidgetComponent;
