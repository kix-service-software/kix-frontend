import { NotesComponentState } from './model/NotesComponentState';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

class NotesWidgetComponent {

    private componentInititalized: boolean = false;

    private state: NotesComponentState;

    public onCreate(input: any): void {
        this.state = new NotesComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

    public showConfigurationClicked(): void {
        ApplicationStore.getInstance().toggleDialog('notes-configuration');
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    public valueChanged(newValue: string): void {
        this.state.widgetConfiguration.settings.notes = newValue;
        DashboardService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.widgetConfiguration);
    }

    public toggleEditMode(): void {
        this.state.editMode = !this.state.editMode;
    }
}

module.exports = NotesWidgetComponent;
