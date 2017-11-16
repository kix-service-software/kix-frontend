import { WidgetBaseComponent } from '@kix/core/dist/model/client/';

import { NotesComponentState } from './model/NotesComponentState';
import { DashboardStore } from '../../../../../core/dist/model/client/dashboard/store/DashboardStore';

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
        DashboardStore.saveWidgetConfiguration('chart-widget', this.state.instanceId, this.state.widgetConfiguration);
    }

    public toggleEditMode(): void {
        this.state.editMode = !this.state.editMode;
    }
}

module.exports = NotesWidgetComponent;
