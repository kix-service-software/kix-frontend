import { MenuEntry } from '@kix/core/dist/model';
import { MenuComponentState } from './MenuComponentState';
import { ComponentRouterService } from '@kix/core/dist/browser/router/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { MainMenuSocketListener } from './MainMenuSocketListener';

class KIXMenuComponent {

    public state: MenuComponentState;

    public onCreate(input: any): void {
        this.state = new MenuComponentState();
    }

    public onMount(): void {
        ComponentRouterService.getInstance().addServiceListener(this.stateChanged.bind(this));
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

    private stateChanged(): void {
        const contextId = ContextService.getInstance().getActiveContextId();
        for (const entry of this.state.primaryMenuEntries) {
            entry.active = entry.contextId === contextId;
        }

        for (const entry of this.state.secondaryMenuEntries) {
            entry.active = entry.contextId === contextId;
        }

        (this as any).setStateDirty('primaryMenuEntries');
    }

    private menuClicked(contextId: string, event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        ComponentRouterService.getInstance().navigate('base-router', contextId, {});
    }

}

module.exports = KIXMenuComponent;
