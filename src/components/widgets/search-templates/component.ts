import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";
import { SearchTemplatesComponentState } from './model/SearchTemplatesComponentState';
import { ContextService } from "@kix/core/dist/browser/context/ContextService";

class SearchTemplatesWidgetComponent {

    private state: SearchTemplatesComponentState;

    public onCreate(input: any): void {
        this.state = new SearchTemplatesComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
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
        ApplicationStore.getInstance().toggleMainDialog('search-templates-configuration');
    }

    private saveConfiguration(): void {
        this.cancelConfiguration();
    }

    private cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = SearchTemplatesWidgetComponent;
