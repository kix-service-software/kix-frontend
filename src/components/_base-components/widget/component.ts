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
            // TODO: bessere Lösung finden, ob Content fertig gerendert wurde nach aufklappen
            // ggf. also nicht state.minimized übergeben, sondern einen "marko-fertig-gerendert" Status
            // onUpdate der Eltern-Componente triggert nicht immer -.-
            setTimeout(() => {
                (this as any).emit('minimizeChanged', this.state.minimized);
            }, 200);
        }
    }

    private minimizeExplorer(): void {
        ContextStore.getInstance().toggleExplorerBar();
    }

    private showConfiguration(): void {
        ApplicationStore.getInstance().toggleDialog(
            this.state.configurationTagId, { instanceId: this.state.instanceId }
        );
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
        return input && (Object.keys(input).length > 0);
    }

}

module.exports = WidgetComponent;
