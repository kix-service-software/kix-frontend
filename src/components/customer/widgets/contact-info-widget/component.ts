import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory } from "@kix/core/dist/browser";
import { KIXObjectType, KIXObject, Contact } from "@kix/core/dist/model";

class Component {
    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;

        const context = ContextService.getInstance().getActiveContext();
        context.registerListener({
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectChanged: (objectId: string | number, object: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.state.contact = object;
                }
            }
        });

        // FIXME: context.load(...)
        // this.state.contact = (context.getObject(context.objectId) as Contact);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setActions();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, this.state.contact
            );
        }
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

}

module.exports = Component;
