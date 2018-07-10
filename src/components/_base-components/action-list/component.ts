import { ComponentState } from './ComponentState';
import { ContextService, AbstractContextServiceListener } from "@kix/core/dist/browser/context/";
import { Context, KIXObject, IActionListener } from '@kix/core/dist/model';
import { IContextListener } from '@kix/core/dist/browser/context/IContextListener';
import { IdService, WidgetService } from '@kix/core/dist/browser';

export class Component implements IActionListener {

    private state: ComponentState;
    private resizeTimeout: any = null;

    public listenerInstanceId: string;

    private contextListernerId: string;
    private contextListener: ComponentContextListener = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.listenerInstanceId = input.instanceId;
        this.contextListernerId = IdService.generateDateBasedId('action-list-');
    }

    public onInput(input: any): void {
        // TODO: noch notwendig für Content-Actions (siehe "base"-widget)
        this.state.actionList = input.list;
        this.prepareActionLists();
    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            if (this.state.keepShow) {
                this.state.keepShow = false;
            } else {
                this.state.showListExpansion = false;
            }
        }, false);

        if (this.listenerInstanceId) {
            WidgetService.getInstance().registerActionListener(this);
            this.actionsChanged();
        } else {
            // TODO: noch notwendig für Content-Actions (siehe "base"-widget)
            this.prepareActionLists();
        }

        ContextService.getInstance().registerListener(new ComponentContextServiceListener(this));
        this.contextListener = new ComponentContextListener(this);

        window.addEventListener("resize", this.windowResizeThrottler.bind(this), false);
    }

    public setContext(context: Context<any>): void {
        context.registerListener(this.contextListernerId, this.contextListener);
    }

    private windowResizeThrottler() {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(() => {
                this.resizeTimeout = null;
                this.prepareActionLists();
            }, 66);
        }
    }

    public prepareActionLists() {
        const listWidth = (this as any).getEl('action-list') ? (this as any).getEl('action-list').scrollWidth : 0;
        if (listWidth > 0 && this.state.actionList) {
            // TODO: 110px Breite für jede Action (ggf. aus CSS ermitteln) + 50px Puffer (... + margin/padding)
            const maxActions = Math.floor((listWidth - 50) / 110);
            this.state.listDefault = this.state.actionList.slice(0, maxActions);
            this.state.listExpansion = this.state.actionList.slice(maxActions);
        }
    }

    public toggleListExpansion(): any {
        this.state.showListExpansion = !this.state.showListExpansion;
        this.state.keepShow = !this.state.keepShow;
    }

    public actionsChanged(): void {
        this.state.actionList = WidgetService.getInstance().getRegisteredActions(this.listenerInstanceId);
        this.prepareActionLists();
    }

    public actionDataChanged(): void {
        (this as any).setStateDirty('listDefault');
        (this as any).setStateDirty('listExpansion');
    }
}

// tslint:disable-next-line:max-classes-per-file
class ComponentContextServiceListener extends AbstractContextServiceListener {

    public constructor(private actionListComponent: Component) {
        super();
    }

    public contextChanged(contextId: string, context: Context<any>): void {
        this.actionListComponent.setContext(context);
    }

}

// tslint:disable-next-line:max-classes-per-file
class ComponentContextListener implements IContextListener {

    public constructor(private actionListComponent: Component) { }

    public sidebarToggled(): void {
        setTimeout(() => {
            this.actionListComponent.prepareActionLists();
        }, 50);
    }

    public explorerBarToggled(): void {
        setTimeout(() => {
            this.actionListComponent.prepareActionLists();
        }, 50);
    }

    public objectChanged(objectId: string | number, object: KIXObject<any>): void {
        //
    }
    public objectProvided(objectId: string | number, object: KIXObject<any>): void {
        //
    }
}


module.exports = Component;
