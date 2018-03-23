import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { BaseWidgetComponentState } from './BaseWidgetComponentState';
import { IdService } from '@kix/core/dist/browser/IdService';
import { ContextNotification } from '@kix/core/dist/browser/context';
import { WidgetType } from '@kix/core/dist/model';

class WidgetComponent {

    private state: BaseWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new BaseWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId ? input.instanceId : IdService.generateDateBasedId();
        this.state.configurationTagId = input.configurationTagId;
        this.state.explorer = input.explorer;
        this.state.hasConfigOverlay = typeof input.hasConfigOverlay !== 'undefined' ? input.hasConfigOverlay : false;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
        this.state.isLoading = typeof input.isLoading !== 'undefined' ? input.isLoading : false;
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const config = ContextService.getInstance().getContext().getWidgetConfiguration(this.state.instanceId);
        if (config) {
            if ((config.type & WidgetType.SIDEBAR) === WidgetType.SIDEBAR) {
                this.state.minimizable = false;
                this.state.minimized = false;
            } else {
                this.state.minimizable = config.minimizable;
                this.state.minimized = config.minimized;
            }
        }
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.instanceId && type === ContextNotification.TOGGLE_WIDGET) {
            this.state.minimized = args[0];
        }
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
            ApplicationService.getInstance().toggleMainDialog(
                this.state.configurationTagId, { instanceId: this.state.instanceId }
            );
        }
    }

    private resetConfiguration(): void {
        this.state.configChanged = false;
    }

    private isConfigMode(): boolean {
        return ApplicationService.getInstance().isConfigurationMode();
    }

    private hasFilter(filter: any): boolean {
        return this.isInputDefined(filter) && !this.isConfigMode();
    }

    private isInputDefined(input: any): boolean {
        return input && Boolean(Object.keys(input).length);
    }

    private hasConfigurationOverlay(): boolean {
        return this.isConfigMode() && this.state.hasConfigOverlay && this.state.configurationTagId !== undefined;
    }

}

module.exports = WidgetComponent;
