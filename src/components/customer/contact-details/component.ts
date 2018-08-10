import { ComponentState } from "./ComponentState";
import { KIXObjectType, WidgetType, Contact, ContextType } from "@kix/core/dist/model";
import {
    ContextService, ActionFactory, IdService, WidgetService, KIXObjectServiceRegistry
} from "@kix/core/dist/browser";
import { ContactDetailsContext } from "@kix/core/dist/browser/contact";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as ContactDetailsContext);
        this.state.contactId = context.objectId.toString();
        if (!this.state.contactId) {
            this.state.error = 'No contact id given.';
        } else {
            this.state.configuration = context.configuration;
            this.state.lanes = context.getLanes();
            this.state.tabWidgets = context.getLaneTabs();
            await this.loadContact();
            this.setActions();
        }
    }

    private async loadContact(): Promise<void> {
        this.state.contact = await ContextService.getInstance().getObject<Contact>(
            KIXObjectType.CONTACT, ContextType.MAIN
        );

        this.state.loadingContact = false;
        if (!this.state.contact) {
            this.state.error = `No contact found for id ${this.state.contactId}`;
        }
    }

    private setActions(): void {
        const config = this.state.configuration;
        if (config && this.state.contact) {
            const actions = ActionFactory.getInstance().generateActions(
                config.generalActions, true, [this.state.contact]
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);
        }
    }

    public getContactActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.contactId) {
            actions = ActionFactory.getInstance().generateActions(config.contactActions, true, [this.state.contact]);
        }
        return actions;
    }

    public getTitle(): string {
        const context = ContextService.getInstance().getActiveContext();
        return context.getDisplayText();

    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
