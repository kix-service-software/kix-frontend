import { MenuEntry, Context, ContextType } from '@kix/core/dist/model';
import { MenuComponentState } from './MenuComponentState';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { MainMenuSocketListener } from './MainMenuSocketListener';
import { IContextServiceListener } from '@kix/core/dist/browser';
import { RoutingConfiguration } from '@kix/core/dist/browser/router';

class KIXMenuComponent implements IContextServiceListener {

    public state: MenuComponentState;

    public onCreate(input: any): void {
        this.state = new MenuComponentState();
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener(this);
        await this.loadEntries();
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.setActiveMenuEntry(context);
    }

    private async loadEntries(): Promise<void> {
        const entries = await MainMenuSocketListener.getInstance().loadMenuEntries();
        if (entries) {
            this.state.primaryMenuEntries = entries[0];
            this.state.secondaryMenuEntries = entries[1];
            this.state.showText = entries[2];
        }
    }
    public contextChanged(contextId: string, context: Context, type: ContextType): void {
        if (type === ContextType.MAIN) {
            this.setActiveMenuEntry(context);
        }
    }

    public getRoutingConfiguration(menuEntry: MenuEntry): RoutingConfiguration {
        return new RoutingConfiguration(
            null, menuEntry.contextId, menuEntry.kixObjectType, menuEntry.contextMode, null
        );
    }

    private setActiveMenuEntry(context: Context): void {
        if (context && context.getDescriptor()) {
            this.state.primaryMenuEntries.forEach(
                (me) => me.active = me.contextId === context.getDescriptor().contextId
            );

            this.state.secondaryMenuEntries.forEach(
                (me) => me.active = me.contextId === context.getDescriptor().contextId
            );

            (this as any).setStateDirty('primaryMenuEntries');
        }
    }

}

module.exports = KIXMenuComponent;
