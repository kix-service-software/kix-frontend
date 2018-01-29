import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { ActionListComponentState } from './model/ActionListComponentState';

export class ActionListComponent {

    private state: ActionListComponentState;

    private static MODULE_ID: string = 'ticket-details';

    public onCreate(input: any): void {
        this.state = new ActionListComponentState();
    }

    public onInput(input: any): void {
        this.state.list = [...input.list, ...input.list];
        this.state.expansionList = input.list;

    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            if (this.state.keepShow) {
                this.state.keepShow = false;
            } else {
                this.state.showExpansionList = false;
            }
        }, false);
        console.log((this as any).getEl('action-container').style.width);
        console.log((this as any).getEl('action-container').style.offsetWidth);
        console.log((this as any).getEl('action-container').clientWidth);
        console.log((this as any).getEl('action-container').scrollWidth);
        console.log((this as any).getEl('action-container').clientHeight);
        console.log((this as any).getEl('action-container').scrollHeight);
        console.log((this as any).getEl('action-list').style.width);
        console.log((this as any).getEl('action-list').style.offsetWidth);
        console.log((this as any).getEl('action-list').clientWidth);
        console.log((this as any).getEl('action-list').scrollWidth);
        console.log((this as any).getEl('action-list').clientHeight);
        console.log((this as any).getEl('action-list').scrollHeight);
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
