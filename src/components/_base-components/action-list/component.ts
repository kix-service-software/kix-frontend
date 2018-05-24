import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { ActionListComponentState } from './ActionListComponentState';
import { ContextService, AbstractContextServiceListener } from "@kix/core/dist/browser/context/";
import { Context, KIXObject } from '@kix/core/dist/model';
import { IContextListener } from '../../../../../core/dist/browser/context/IContextListener';

export class ActionListComponent {

    private state: ActionListComponentState;
    private resizeTimeout: any = null;

    private context: Context<any> = null;
    private contextListener: ComponentContextListener = null;

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
        ContextService.getInstance().registerListener(new ComponentContextServiceListener(this));
        this.contextListener = new ComponentContextListener(this);
        window.addEventListener("resize", this.windowResizeThrottler.bind(this), false);
    }

    public setContext(context: Context<any>): void {
        this.context = context;
        context.registerListener(this.contextListener);
    }

    private windowResizeThrottler() {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(() => {
                this.resizeTimeout = null;
                this.prepareLists();
            }, 66);
        }
    }

    public prepareLists() {
        const listWidth = (this as any).getEl('action-list') ? (this as any).getEl('action-list').scrollWidth : 0;
        if (listWidth > 0 && this.state.actionList) {
            // TODO: 110px Breite für jede Action (ggf. aus CSS ermitteln) + 50px Puffer (... + margin/padding)
            const maxActions = Math.floor((listWidth - 50) / 110);
            this.state.listDefault = this.state.actionList.slice(0, maxActions);
            this.state.listExpansion = this.state.actionList.slice(maxActions);
        }
    }

    private toggleListExpansion(): any {
        this.state.showListExpansion = !this.state.showListExpansion;
        this.state.keepShow = !this.state.keepShow;
    }
}

// tslint:disable-next-line:max-classes-per-file
class ComponentContextServiceListener extends AbstractContextServiceListener {

    public constructor(private actionListComponent: ActionListComponent) {
        super();
    }

    public contextChanged(contextId: string, context: Context<any>): void {
        this.actionListComponent.setContext(context);
    }

}

// tslint:disable-next-line:max-classes-per-file
class ComponentContextListener implements IContextListener {

    public constructor(private actionListComponent: ActionListComponent) { }

    public sidebarToggled(): void {
        setTimeout(() => {
            this.actionListComponent.prepareLists();
        }, 50);
    }

    public explorerBarToggled(): void {
        setTimeout(() => {
            this.actionListComponent.prepareLists();
        }, 50);
    }

    public objectChanged(objectId: string | number, object: KIXObject<any>): void {
        //
    }
    public objectProvided(objectId: string | number, object: KIXObject<any>): void {
        //
    }
}


module.exports = ActionListComponent;
