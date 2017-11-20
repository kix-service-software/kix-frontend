import { MenuEntry, MenuEntryConfiguration } from '@kix/core/dist/model';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
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

    private showTextOptionChanged(event: any): void {
        this.state.configuration.showText = !this.state.configuration.showText;
        (this as any).setStateDirty('configuration');
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

    private movePrimaryEntryUp(event: any): void {
        this.state.configuration.primaryMenuEntryConfigurations =
            this.moveEntryUp(this.state.primaryEntryId, this.state.configuration.primaryMenuEntryConfigurations);
        (this as any).setStateDirty('configuration');
    }

    private movePrimaryEntryDown(event: any): void {
        this.state.configuration.primaryMenuEntryConfigurations =
            this.moveEntryDown(this.state.primaryEntryId, this.state.configuration.primaryMenuEntryConfigurations);
        (this as any).setStateDirty('configuration');
    }

    private moveSecondaryEntryUp(event: any): void {
        this.state.configuration.secondaryMenuEntryConfigurations =
            this.moveEntryUp(this.state.secondaryEntryId, this.state.configuration.secondaryMenuEntryConfigurations);
        (this as any).setStateDirty('configuration');
    }

    private moveSecondaryEntryDown(event: any): void {
        this.state.configuration.secondaryMenuEntryConfigurations =
            this.moveEntryDown(this.state.secondaryEntryId, this.state.configuration.secondaryMenuEntryConfigurations);
        (this as any).setStateDirty('configuration');
    }

    private moveEntryUp(contextId: string, entries: MenuEntryConfiguration[]): MenuEntryConfiguration[] {
        const index = entries.findIndex((me) => me.contextId === contextId);
        if (index > 0) {
            const entry = entries[index];

            entries[index] = entries[index - 1];
            entries[index - 1] = entry;
        }

        return entries;
    }

    private moveEntryDown(contextId: string, entries: MenuEntryConfiguration[]): MenuEntryConfiguration[] {
        const index = entries.findIndex((me) => me.contextId === contextId);
        if (index < entries.length - 1) {
            const entry = entries[index];
            entries[index] = entries[index + 1];
            entries[index + 1] = entry;
        }

        return entries;
    }
}

module.exports = KIXMenuPersonalSettingsComponent;
