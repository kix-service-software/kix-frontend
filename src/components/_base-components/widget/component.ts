import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ContextStore } from '@kix/core/dist/browser/context/ContextStore';

class WidgetComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            minimized: false,
            configChanged: false,
            instanceId: null,
            configurationTagId: null,
            explorer: false
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.configurationTagId = input.configurationTagId;
        this.state.explorer = input.explorer;
        this.state.minimized = input.minimized;
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
    }

    private minimizeWidget(): void {
        if (this.state.explorer) {
            ContextStore.getInstance().toggleExplorer();
        } else {
            this.state.minimized = !this.state.minimized;
        }
    }

    private minimizeExplorer(): void {
        ContextStore.getInstance().toggleExplorerBar();
    }

    private showConfiguration(): void {
        if (this.state.configurationTagId) {
            ApplicationStore.getInstance().toggleDialog(
                this.state.configurationTagId, { instanceId: this.state.instanceId }
            );
        }
    }

    private resetConfiguration(): void {
        // TODO: hol alten Stand aus Browser "cache" und überschreib neue Konfiguration
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
