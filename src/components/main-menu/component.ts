import { MenuEntry, Context, ContextType, ContextMode } from '../../core/model';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../core/browser/context/ContextService';
import { MainMenuSocketClient } from './MainMenuSocketClient';
import { IContextServiceListener } from '../../core/browser';
import { RoutingConfiguration } from '../../core/browser/router';

class KIXMenuComponent implements IContextServiceListener {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener(this);
        await this.loadEntries();
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.setActiveMenuEntry(context);
    }

    private async loadEntries(): Promise<void> {
        const entries = await MainMenuSocketClient.getInstance().loadMenuEntries();
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
            null, menuEntry.mainContextId, null, ContextMode.DASHBOARD, null
        );
    }

    private setActiveMenuEntry(context: Context): void {
        if (context && context.getDescriptor()) {
            this.state.primaryMenuEntries.forEach(
                (me) => me.active = me.contextIds.some((id) => id === context.getDescriptor().contextId)
            );

            this.state.secondaryMenuEntries.forEach(
                (me) => me.active = me.contextIds.some((id) => id === context.getDescriptor().contextId)
            );

            (this as any).setStateDirty('primaryMenuEntries');
        }
    }

}

module.exports = KIXMenuComponent;
