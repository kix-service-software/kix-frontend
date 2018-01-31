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
        this.state.actionList = input.list;
        this.prepareLists();
    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            if (this.state.keepShow) {
                this.state.keepShow = false;
            } else {
                this.state.showListExpansion = false;
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
        const listWidth = (this as any).getEl('action-list') ? (this as any).getEl('action-list').scrollWidth : 0;
        if (listWidth > 0 && this.state.actionList) {
            // TODO: 110px Breite für jede Action (ggf. aus CSS ermitteln) + 50px Puffer (... + margin/padding)
            const maxActions = Math.floor((listWidth - 50) / 110);
            this.state.listDefault = this.state.actionList.slice(0, maxActions);
            this.state.listExpansion = this.state.actionList.slice(maxActions);
        }
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }

    private toggleListExpansion(): any {
        this.state.showListExpansion = !this.state.showListExpansion;
        this.state.keepShow = !this.state.keepShow;
    }
}

module.exports = ActionListComponent;
