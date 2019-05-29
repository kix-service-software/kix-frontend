import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';
import { RoutingConfiguration } from '../../../core/browser/router';
import {
    KIXObjectType, ContextMode, OrganisationProperty, ContactProperty, Organisation, Contact
} from '../../../core/model';
import { ContactDetailsContext } from '../../../core/browser/contact';
import { OrganisationDetailsContext } from '../../../core/browser/organisation';

class Component {

    private state: ComponentState;

    public routingConfiguration: RoutingConfiguration;
    public objectId: number;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.labelProvider = input.labelProvider;
        this.state.property = input.property;
        this.state.object = input.object;
        if (this.state.object.KIXObjectType === KIXObjectType.ORGANISATION) {
            this.objectId = (this.state.object as Organisation).ID;
        } else if (this.state.object.KIXObjectType === KIXObjectType.CONTACT) {
            this.objectId = (this.state.object as Contact).ID;
        }
    }

    public async onMount(): Promise<void> {
        this.state.propertyText = await this.state.labelProvider.getPropertyText(this.state.property);
        this.state.displayText = await this.state.labelProvider.getDisplayText(this.state.object, this.state.property);
        await this.initRoutingConfiguration();
        this.state.title = `${this.state.propertyText}: ${this.state.displayText}`;
    }

    private async initRoutingConfiguration(): Promise<void> {
        if (this.state.object.KIXObjectType === KIXObjectType.ORGANISATION) {
            if (this.state.property === OrganisationProperty.ID
                || this.state.property === OrganisationProperty.NAME) {
                const context = await ContextService.getInstance().getContext(OrganisationDetailsContext.CONTEXT_ID);
                const contextDescriptor = context.getDescriptor();
                this.routingConfiguration = new RoutingConfiguration(
                    OrganisationDetailsContext.CONTEXT_ID, KIXObjectType.ORGANISATION,
                    ContextMode.DETAILS, OrganisationProperty.ID, false
                );
            }
        } else if (this.state.object.KIXObjectType === KIXObjectType.CONTACT) {
            if (this.state.property === ContactProperty.FIRST_NAME
                || this.state.property === ContactProperty.LAST_NAME
                || this.state.property === ContactProperty.LOGIN) {
                const context = await ContextService.getInstance().getContext(ContactDetailsContext.CONTEXT_ID);
                const contextDescriptor = context.getDescriptor();
                this.routingConfiguration = new RoutingConfiguration(
                    ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                    ContextMode.DETAILS, ContactProperty.ID, false
                );
            }
        }
    }
}

module.exports = Component;
