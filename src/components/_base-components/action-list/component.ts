import { ComponentState } from './ComponentState';
import { ContextService, AbstractContextServiceListener } from "../../../core/browser/context/";
import { Context, KIXObject, IActionListener } from '../../../core/model';
import { IContextListener } from '../../../core/browser/context/IContextListener';
import { IdService, WidgetService } from '../../../core/browser';

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
        this.state.actionList = input.list;
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
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
            const actionWidth = (this.state.displayText ? 9.5 : 1.75) * this.getBrowserFontsize();
            const gapWith = 1.5 * this.getBrowserFontsize();
            let maxActions = this.state.actionList.length;
            while ((maxActions * actionWidth) + ((maxActions - 1) * gapWith) > listWidth && maxActions > 0) {
                maxActions--;
            }
            this.state.listDefault = this.state.actionList.slice(0, maxActions);
            this.state.listExpansion = this.state.actionList.slice(maxActions);
        }
    }

    private getBrowserFontsize(): number {
        const browserFontSizeSetting = window
            .getComputedStyle(document.getElementsByTagName("body")[0], null)
            .getPropertyValue("font-size");
        return Number(browserFontSizeSetting.replace('px', ''));
    }

    public toggleListExpansion(): any {
        this.state.showListExpansion = !this.state.showListExpansion;
        this.state.keepShow = !this.state.keepShow;
    }

    public actionsChanged(): void {
        const actions = WidgetService.getInstance().getRegisteredActions(this.listenerInstanceId);
        if (actions) {
            this.state.actionList = actions[0];
            this.state.displayText = actions[1];
            this.prepareActionLists();
        }
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
        return;
    }

    public objectProvided(objectId: string | number, object: KIXObject<any>): void {
        return;
    }

    public objectListChanged(objectList: KIXObject[]): void {
        return;
    }

    public filteredObjectListChanged(objectList: KIXObject[]): void {
        return;
    }

    public scrollInformationChanged(): void {
        return;
    }
}


module.exports = Component;
