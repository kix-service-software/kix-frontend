import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

class WidgetComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            minimized: false,
            minimizable: true,
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
        this.state.minimizable = input.minimizable !== undefined ? input.minimizable : true;
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
    }

    private minimizeWidget(): void {
        if (this.state.minimizable) {
            if (this.state.explorer) {
                ContextService.getInstance().toggleExplorer();
            } else {
                this.state.minimized = !this.state.minimized;
            }
        }
    }

    private minimizeExplorer(): void {
        ContextService.getInstance().toggleExplorerBar();
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

    private hasFilter(filter: any): boolean {
        return this.isInputDefined(filter) && !this.isConfigMode();
    }

    private isInputDefined(input: any): boolean {
        return input && Boolean(Object.keys(input).length);
    }

}

module.exports = WidgetComponent;
