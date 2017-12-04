import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

class WidgetComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            minimized: false,
            configChanged: false
        };
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
    }

    private minimizeWidget(): void {
        this.state.minimized = !this.state.minimized;
    }

    private showConfiguration(): void {
        (this as any).emit('showConfiguration');
    }

    private resetConfiguration(): void {
        // TODO: hol alten stand aus browser "cache" und überschreib neue konfiguration
        this.state.configChanged = false;
    }

    private applicationStateChanged() {
        (this as any).setStateDirty();
    }

    private isConfigMode(): boolean {
        return ApplicationStore.getInstance().isConfigurationMode();
    }

}

module.exports = WidgetComponent;
