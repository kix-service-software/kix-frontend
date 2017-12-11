import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

class WidgetComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            minimized: false,
            configChanged: false,
            instanceId: null,
            configurationTagId: null
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.configurationTagId = input.configurationTagId;
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
    }

    private minimizeWidget(): void {
        this.state.minimized = !this.state.minimized;
    }

    private showConfiguration(): void {
        ApplicationStore.getInstance().toggleDialog(
            this.state.configurationTagId, { instanceId: this.state.instanceId }
        );
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
