import { ComponentState } from "./ComponentState";
import { ContextService } from "../../../core/browser";
import { CustomerDetailsContext } from "../../../core/browser/customer";
import { RoutingConfiguration } from "../../../core/browser/router";
import { KIXObjectType, ContextMode, CustomerProperty, ContactProperty, Customer, Contact } from "../../../core/model";
import { ContactDetailsContext } from "../../../core/browser/contact";

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
                    contextDescriptor.urlPaths[0], CustomerDetailsContext.CONTEXT_ID, KIXObjectType.CUSTOMER,
                    ContextMode.DETAILS, CustomerProperty.CUSTOMER_ID, false
                );
            }
        } else if (this.state.object.KIXObjectType === KIXObjectType.CONTACT) {
            if (this.state.property === ContactProperty.USER_FIRST_NAME
                || this.state.property === ContactProperty.USER_LAST_NAME
                || this.state.property === ContactProperty.USER_LOGIN) {
                const context = await ContextService.getInstance().getContext(ContactDetailsContext.CONTEXT_ID);
                const contextDescriptor = context.getDescriptor();
                this.routingConfiguration = new RoutingConfiguration(
                    contextDescriptor.urlPaths[0], ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                    ContextMode.DETAILS, ContactProperty.ContactID, false
                );
            }
        }
    }
}

module.exports = Component;
