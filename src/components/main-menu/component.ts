import { MenuEntry } from '@kix/core/dist/model';
import { MenuComponentState } from './model/MenuComponentState';
import { MainMenuState } from './store/';
import { MAIN_MENU_INITIALIZE } from './store/actions';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ComponentRouterService } from '@kix/core/dist/browser/router/';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';

class KIXMenuComponent {

    public state: MenuComponentState;
    public store: any;

    public onCreate(input: any): void {
        this.state = new MenuComponentState();
    }

    public onMount(): void {
        this.store = require('./store');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(MAIN_MENU_INITIALIZE());
        ComponentRouterService.getInstance().addServiceListener(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        const reduxState: MainMenuState = this.store.getState();
        if (reduxState.primaryMenuEntries) {
            this.state.primaryMenuEntries = reduxState.primaryMenuEntries;
            this.state.secondaryMenuEntries = reduxState.secondaryMenuEntries;
            this.state.showText = reduxState.showText;

            const contextId = ContextService.getInstance().getActiveContextId();
            for (const entry of this.state.primaryMenuEntries) {
                entry.active = entry.contextId === contextId;
            }

            for (const entry of this.state.secondaryMenuEntries) {
                entry.active = entry.contextId === contextId;
            }

            (this as any).setStateDirty('primaryMenuEntries');
        }
    }

    private menuClicked(contextId: string, event: any): void {
        if (event.preventDefault) {
            event.preventDefault();
        }
        ComponentRouterService.getInstance().navigate('base-router', contextId, {});
    }

}

module.exports = KIXMenuComponent;
