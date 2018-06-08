import { MenuEntry, Context, ContextType } from '@kix/core/dist/model';
import { MenuComponentState } from './MenuComponentState';
import { ComponentRouterService } from '@kix/core/dist/browser/router/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { MainMenuSocketListener } from './MainMenuSocketListener';
import { IContextServiceListener } from '@kix/core/dist/browser';

class KIXMenuComponent implements IContextServiceListener {

    public state: MenuComponentState;

    public onCreate(input: any): void {
        this.state = new MenuComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().registerListener(this);
        this.loadEntries();
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
        this.state.primaryMenuEntries.forEach((me) => me.active = me.contextId === context.descriptor.contextId);
        this.state.secondaryMenuEntries.forEach((me) => me.active = me.contextId === context.descriptor.contextId);
        (this as any).setStateDirty('primaryMenuEntries');
    }

    public menuClicked(menuEntry: MenuEntry, event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        ContextService.getInstance().setContext(menuEntry.kixObjectType, menuEntry.contextMode);
    }

}

module.exports = KIXMenuComponent;
