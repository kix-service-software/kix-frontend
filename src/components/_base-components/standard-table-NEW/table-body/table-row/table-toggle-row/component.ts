import { ComponentState } from './ComponentState';
import {
    ToggleOptions, ComponentsService, AbstractMarkoComponent, BrowserUtil, ActionFactory, ContextService
} from '../../../../../../core/browser';
import { IAction } from '../../../../../../core/model';
import { IRow, TableEvent } from '../../../../../../core/browser/table';
import { IEventSubscriber, EventService } from '../../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private toggleOptions: ToggleOptions;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.row = input.row;
        if (this.state.row) {
            this.toggleOptions = this.state.row.getTable().getTableConfiguration().toggleOptions;
            this.setWidth();
        }
    }

    public async onMount(): Promise<void> {
        this.setWidth();
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener((this.state.row.getRowId() + '-toggle'), {
            sidebarToggled: () => { this.setWidth(); },
            explorerBarToggled: () => { this.setWidth(); },
            objectChanged: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });
        window.addEventListener("resize", this.setWidth.bind(this), false);
        this.eventSubscriberId = this.state.row.getTable().getTableId() + '-' + this.state.row.getRowId();
        EventService.getInstance().subscribe(TableEvent.REFRESH, this);
    }

    public onDestroy(): void {
        window.removeEventListener("resize", this.setWidth.bind(this), false);
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this);
    }

    public eventPublished(data: any, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.REFRESH && data === this.state.row.getTable().getTableId()) {
            this.setWidth();
        }
    }

    private setWidth(): void {
        setTimeout(() => {
            const root = (this as any).getEl();
            let width;
            if (root) {
                let container = root.parentNode;
                while (container && container.className !== 'table-container') {
                    container = container.parentNode ? container.parentNode : null;
                }
                if (container) {
                    width = container.clientWidth - 2.5 * BrowserUtil.getBrowserFontsize();
                }
            }
            this.state.width = (width ? width + 'px' : '100%');
        }, 70);
    }

    public getToggleActions(): IAction[] {
        const actions = this.toggleOptions && this.state.row ? ActionFactory.getInstance().generateActions(
            this.toggleOptions.actions, [this.state.row.getRowObject().getObject()]
        ) : [];
        return actions;
    }

    public calculateToggleContentMinHeight(index: number): string {
        const minHeight = "10em"; // TODO: echten Wert ermitteln .toggle-row > td >.content
        setTimeout(() => {
            const actions = this.getToggleActions();
            if (actions && actions.length > 5) {
                const actionList = (this as any).getEl().querySelector('ul.toggle-actions');
                if (actionList) {
                    const computedHeight = getComputedStyle(actionList).height;
                    const rowContent = (this as any).getEl("row-toggle-content");
                    if (rowContent && computedHeight) {
                        rowContent.style.minHeight = computedHeight;
                    }
                }
            }
        }, 10);

        return minHeight;
    }

    public getToggleTemplate(): any {
        return this.toggleOptions && this.toggleOptions.componentId ?
            ComponentsService.getInstance().getComponentTemplate(this.toggleOptions.componentId) : undefined;
    }

    public getToggleInput(): any {
        const toggleInput = {};
        if (this.state.row && this.toggleOptions && this.toggleOptions.inputPropertyName) {
            toggleInput[this.toggleOptions.inputPropertyName] = this.state.row.getRowObject().getObject();
        }
        return toggleInput;
    }
}

module.exports = Component;
