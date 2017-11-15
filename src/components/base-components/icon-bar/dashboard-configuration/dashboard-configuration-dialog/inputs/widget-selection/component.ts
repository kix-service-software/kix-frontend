import { TranslationHandler } from '@kix/core/dist/model/client';
import { WidgetSelectionComponentState } from './model/WidgetSelectionComponentState';

class WidgetSelection {

    private state: WidgetSelectionComponentState;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = new WidgetSelectionComponentState();
        this.state.firstList = input.firstList;
        this.state.secondList = input.secondList;
        this.state.actions = input.actions;
        this.state.firstListFixed = input.firstListFixed;
    }

    public async onMount(input: any): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        // this.state.translations = translationHandler.getTranslations([]);
    }

    // private getTranslation(id: ConfigurationWidgetTranslationId): string {
    //     return (this.state.translations && this.state.translations[id]) ?
    // this.state.translations[id] : id.toString();
    // }

    private firstListSelected(event: any): void {
        console.log(event.target.selectedOptions);
        // this.state.secondaryEntryId = event.target.value;
    }

    private addContentWidget(): void {
        if (this.state.firstListFixed) {
            // don't remove from firstList!!
        }
        // const contextId = this.state.primaryEntryId;
        // const entries = this.state.configuration.primaryMenuEntryConfigurations;
        // const entry = entries.find((me) => me.contextId === contextId);
        // const index = entries.findIndex((me) => me.contextId === contextId);

        // entries.splice(index, 1);

        // this.state.configuration.secondaryMenuEntryConfigurations.push(entry);
        // (this as any).setStateDirty('configuration');
    }

    private removeContentWidget(): void {
        // const contextId = this.state.secondaryEntryId;
        // const entries: any[] = this.state.configuration.secondaryMenuEntryConfigurations;
        // const entry = entries.find((me) => me.contextId === contextId);
        // const index = entries.findIndex((me) => me.contextId === contextId);

        // entries.splice(index, 1);

        // this.state.configuration.primaryMenuEntryConfigurations.push(entry);
        // (this as any).setStateDirty('configuration');
    }

}

module.exports = WidgetSelection;
