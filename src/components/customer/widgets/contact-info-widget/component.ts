import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory } from "@kix/core/dist/browser";
import { KIXObjectType, KIXObject, Contact, ContextMode } from "@kix/core/dist/model";

class Component {
    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const contacts = await ContextService.getInstance().loadObjects<Contact>(
            KIXObjectType.CONTACT, [context.objectId], ContextMode.DETAILS
        );

        if (contacts && contacts.length) {
            this.state.contact = contacts[0];
            this.setActions();
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, this.state.contact
            );
        }
    }

}

module.exports = Component;
