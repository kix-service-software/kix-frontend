import { ComponentState } from "./ComponentState";
import { ContextType, KIXObjectType, WidgetType, Contact } from "@kix/core/dist/model";
import { ContextService, ActionFactory, IdService } from "@kix/core/dist/browser";
import { ContactDetailsContext, ContactService } from "@kix/core/dist/browser/contact";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.contactId);
    }

    public async  onMount(): Promise<void> {

        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, contactDetailsCOntext: ContactDetailsContext, type: ContextType) => {
                if (type === ContextType.MAIN && contextId === ContactDetailsContext.CONTEXT_ID) {
                    this.state.configuration = contactDetailsCOntext.configuration;
                    this.state.loadingConfig = false;
                    this.state.lanes = contactDetailsCOntext.getLanes();
                    this.state.tabWidgets = contactDetailsCOntext.getLaneTabs();
                    (this as any).update();
                }
            }
        });

        const contextURL = ContactDetailsContext.CONTEXT_ID + '/' + this.state.contactId;
        const context = new ContactDetailsContext(this.state.contactId);
        await ContextService.getInstance().provideContext(context, true, ContextType.MAIN);
        await this.loadContact();
    }

    private async loadContact(): Promise<void> {
        const contacts = await ContactService.getInstance().loadContacts([this.state.contactId]);
        if (contacts && contacts.length) {
            this.state.contact = contacts[0];
            const context = ContextService.getInstance().getContext(null, ContactDetailsContext.CONTEXT_ID);
            context.provideObject(this.state.contact.ContactID, this.state.contact, KIXObjectType.CUSTOMER);
        }
        this.state.loadingContact = false;
    }

    private getActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.contactId) {
            actions = ActionFactory.getInstance().generateActions(config.generalActions, true, this.state.contact);
        }
        return actions;
    }

    private getContactActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.contactId) {
            actions = ActionFactory.getInstance().generateActions(config.contactActions, true, this.state.contact);
        }
        return actions;
    }

    private getTitle(): string {
        return this.state.contact
            ? this.state.contact.DisplayValue
            : 'Kunde: ' + this.state.contactId;

    }

    private getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
