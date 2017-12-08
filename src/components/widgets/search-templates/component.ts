import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { DashboardStore } from '@kix/core/dist/browser/dashboard/DashboardStore';
import { SearchTemplatesComponentState } from './model/SearchTemplatesComponentState';

class SearchTemplatesWidgetComponent {

    private state: SearchTemplatesComponentState;

    public onCreate(input: any): void {
        this.state = new SearchTemplatesComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.state.widgetConfiguration =
            DashboardStore.getInstance().getWidgetConfiguration(this.state.instanceId);
    }

    private newClicked(event): void {
        alert('Neue Suchvorlage!');
    }

    private editClicked(event): void {
        alert('Suchvorlage bearbeiten!');
    }

    private deleteClicked(event): void {
        alert('Suchvorlage löschen!');
    }

    private showConfigurationClicked(): void {
        ApplicationStore.getInstance().toggleDialog('search-templates-configuration');
    }

    private saveConfiguration(): void {
        this.cancelConfiguration();
    }

    private cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = SearchTemplatesWidgetComponent;
