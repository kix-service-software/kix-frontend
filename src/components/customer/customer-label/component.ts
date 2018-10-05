import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser";
import { CustomerDetailsContext } from "@kix/core/dist/browser/customer";
import { RoutingConfiguration } from "@kix/core/dist/browser/router";
import { KIXObjectType, ContextMode, CustomerProperty, ContactProperty, Customer, Contact } from "@kix/core/dist/model";
import { ContactDetailsContext } from "@kix/core/dist/browser/contact";

class Component {

    private state: ComponentState;

    public routingConfiguration: RoutingConfiguration;
    public objectId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.labelProvider = input.labelProvider;
        this.state.property = input.property;
        this.state.object = input.object;
        if (this.state.object.KIXObjectType === KIXObjectType.CUSTOMER) {
            this.objectId = (this.state.object as Customer).CustomerID;
        } else if (this.state.object.KIXObjectType === KIXObjectType.CONTACT) {
            this.objectId = (this.state.object as Contact).ContactID;
        }
    }

    public async onMount(): Promise<void> {
        this.state.propertyText = await this.state.labelProvider.getPropertyText(this.state.property);
        this.state.displayText = await this.state.labelProvider.getDisplayText(this.state.object, this.state.property);
        await this.initRoutingConfiguration();
        this.state.title = `${this.state.propertyText}: ${this.state.displayText}`;
    }

    private async initRoutingConfiguration(): Promise<void> {
        if (this.state.object.KIXObjectType === KIXObjectType.CUSTOMER) {
            if (this.state.property === CustomerProperty.CUSTOMER_ID
                || this.state.property === CustomerProperty.CUSTOMER_COMPANY_NAME) {
                const context = await ContextService.getInstance().getContext(CustomerDetailsContext.CONTEXT_ID);
                const contextDescriptor = context.getDescriptor();
                this.routingConfiguration = new RoutingConfiguration(
                    contextDescriptor.urlPath, CustomerDetailsContext.CONTEXT_ID, KIXObjectType.CUSTOMER,
                    ContextMode.DETAILS, CustomerProperty.CUSTOMER_ID, false, true
                );
            }
        } else if (this.state.object.KIXObjectType === KIXObjectType.CONTACT) {
            if (this.state.property === ContactProperty.USER_FIRST_NAME
                || this.state.property === ContactProperty.USER_LAST_NAME
                || this.state.property === ContactProperty.USER_LOGIN) {
                const context = await ContextService.getInstance().getContext(ContactDetailsContext.CONTEXT_ID);
                const contextDescriptor = context.getDescriptor();
                this.routingConfiguration = new RoutingConfiguration(
                    contextDescriptor.urlPath, ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                    ContextMode.DETAILS, ContactProperty.ContactID, false, true
                );
            }
        }
    }
}

module.exports = Component;
