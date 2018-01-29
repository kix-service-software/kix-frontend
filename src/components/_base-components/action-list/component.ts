import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ActionListComponentState } from './model/ActionListComponentState';
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class ActionListComponent {

    private state: ActionListComponentState;
    private resizeTimeout: any = null;

    private static MODULE_ID: string = 'ticket-details';

    public onCreate(input: any): void {
        this.state = new ActionListComponentState();
    }

    public onInput(input: any): void {
        this.state.initList = input.list;
        this.prepareLists();
    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            if (this.state.keepShow) {
                this.state.keepShow = false;
            } else {
                this.state.showExpansionList = false;
            }
        }, false);
        this.prepareLists();
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        window.addEventListener("resize", this.windowResizeThrottler.bind(this), false);
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (
            type === ContextNotification.EXPLORER_BAR_TOGGLED ||
            type === ContextNotification.SIDEBAR_BAR_TOGGLED
        ) {
            setTimeout(() => {
                this.prepareLists();
            }, 50);
        }
    }

    private windowResizeThrottler() {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(() => {
                this.resizeTimeout = null;
                this.prepareLists();
            }, 66);
        }
    }

    private prepareLists() {
        this.state.listWidth = (this as any).getEl('action-list') ? (this as any).getEl('action-list').scrollWidth : 0;
        if (this.state.listWidth > 0) {
            // TODO: 110px Breite für jede Action (ggf. aus CSS ermitteln) + 100px Puffer (... + margin/padding)
            const maxActions = Math.floor((this.state.listWidth - 100) / 110);
            this.state.rowList = this.state.initList.slice(0, maxActions);
            this.state.expansionList = this.state.initList.slice(maxActions);
        }
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }

    private toggleExpansionList(): any {
        this.state.showExpansionList = !this.state.showExpansionList;
        this.state.keepShow = !this.state.keepShow;
    }
}

module.exports = ActionListComponent;
