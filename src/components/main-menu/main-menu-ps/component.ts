import { ClientStorageHandler, MenuEntry } from '@kix/core/dist/model/client';

class KIXMenuPersonalSettingsComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            configuration: null,
            configurationContent: null,
            primaryEntryId: null,
            secondaryEntryId: null
        };
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;
        this.state.configurationContent = input.configurationContent;

        console.log(this.state.configuration);
        console.log(this.state.configurationContent);
    }

    private getUIText(contextId: string): string {
        const menuEntry: MenuEntry =
            this.state.configurationContent.availableMenuEntries.find((me) => me.contextId === contextId);

        let text = contextId;

        if (menuEntry) {
            text = menuEntry.text;
        }

        return text;
    }

    private primaryEntrySelected(event: any): void {
        this.state.primaryEntryId = event.target.value;
    }

    private secondaryEntrySelected(event: any): void {
        this.state.secondaryEntryId = event.target.value;
    }

    private moveToSecondaryMenu(): void {
        const contextId = this.state.primaryEntryId;
        const entries = this.state.configuration.primaryMenuEntryConfigurations;
        const entry = entries.find((me) => me.contextId === contextId);
        const index = entries.findIndex((me) => me.contextId === contextId);

        entries.splice(index, 1);

        this.state.configuration.secondaryMenuEntryConfigurations.push(entry);
        (this as any).setStateDirty('configuration');
    }

    private moveToPrimaryMenu(): void {
        const contextId = this.state.secondaryEntryId;
        const entries: any[] = this.state.configuration.secondaryMenuEntryConfigurations;
        const entry = entries.find((me) => me.contextId === contextId);
        const index = entries.findIndex((me) => me.contextId === contextId);

        entries.splice(index, 1);

        this.state.configuration.primaryMenuEntryConfigurations.push(entry);
        (this as any).setStateDirty('configuration');
    }

}

module.exports = KIXMenuPersonalSettingsComponent;
