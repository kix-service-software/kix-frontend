import { NotesComponentState } from './model/NotesComponentState';
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';

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
        this.state.widgetConfiguration =
            DashboardStore.getWidgetConfiguration('notes-widget', this.state.instanceId);
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    public valueChanged(newValue: string): void {
        this.state.widgetConfiguration.settings.notes = newValue;
        DashboardStore.saveWidgetConfiguration('notes-widget', this.state.instanceId, this.state.widgetConfiguration);
    }

    public toggleEditMode(): void {
        this.state.editMode = !this.state.editMode;
    }
}

module.exports = NotesWidgetComponent;
