import { ComponentState } from "./ComponentState";
import { ContextType, KIXObjectType, WidgetType, Contact, ContextMode } from "@kix/core/dist/model";
import { ContextService, ActionFactory, IdService, WidgetService } from "@kix/core/dist/browser";
import { ContactDetailsContext, ContactService } from "@kix/core/dist/browser/contact";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as ContactDetailsContext);
        this.state.contactId = context.objectId.toString();
        this.state.configuration = context.configuration;
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        this.setActions();
        await this.loadContact();
    }

    private async loadContact(): Promise<void> {
        const contacts = await ContextService.getInstance().loadObjects<Contact>(
            KIXObjectType.CONTACT, [this.state.contactId], ContextMode.DETAILS);
        if (contacts && contacts.length) {
            this.state.contact = contacts[0];
            this.state.loadingContact = false;
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

    private getContactActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.contactId) {
            actions = ActionFactory.getInstance().generateActions(config.contactActions, true, [this.state.contact]);
        }
        return actions;
    }

    private getTitle(): string {
        return this.state.contact
            ? this.state.contact.DisplayValue
            : 'Ansprechpartner: ' + this.state.contactId;

    }

    private getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
