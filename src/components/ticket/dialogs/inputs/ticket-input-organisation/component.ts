import { ComponentState } from "./ComponentState";
import {
    TicketProperty, FormFieldValue, FormInputComponent, FormField,
    KIXObjectType, Organisation, TreeNode, Contact
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { IdService, KIXObjectService, LabelService } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number, ComponentState> {

    private organisations: Organisation[] = [];
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        this.state.placeholder = await TranslationService.translate('Translatable#Please select a contact');

    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.formListenerId = IdService.generateDateBasedId('TicketOrganisationInput');
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListenerId,
            formValueChanged: this.formValueChanged.bind(this),
            updateForm: () => { return; }
        });
        this.setCurrentNode();
    }

    private async formValueChanged(formField: FormField, value: FormFieldValue<any>): Promise<void> {
        if (formField && formField.property === TicketProperty.CONTACT_ID) {
            if (value.value) {
                this.setOrganisationsByContact(value);
            } else {
                this.state.currentNode = null;
                this.state.hasContact = false;
                this.state.nodes = [];
                super.provideValue(null);
            }
        }
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue) {
            const organisationId = this.state.defaultValue.value;
            if (organisationId) {
                if (!isNaN(organisationId)) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, [organisationId]
                    );

                    if (organisations && organisations.length) {
                        const organisation = organisations[0];

                        const displayValue = await LabelService.getInstance().getText(organisation);

                        this.state.currentNode = new TreeNode(organisation.ID, displayValue, 'kix-icon-man-bubble');
                        this.state.nodes = [this.state.currentNode];
                        super.provideValue(organisation.ID);
                    }
                } else {
                    this.state.currentNode = new TreeNode(
                        organisationId, organisationId.toString(), 'kix-icon-man-bubble'
                    );

                    this.state.nodes = [this.state.currentNode];
                    super.provideValue(organisationId);
                }
            } else {
                this.state.currentNode = null;
            }
        }
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
    }

    private organisationChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async setOrganisationsByContact(contactValue: FormFieldValue): Promise<void> {
        if (!isNaN(contactValue.value)) {
            const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [contactValue.value]);
            if (contacts && contacts.length) {
                const contact = contacts[0];
                this.state.primaryOrganisationId = contact.PrimaryOrganisationID;
                await this.loadOrganisations(contact.OrganisationIDs);
            }
        } else {
            this.state.currentNode = new TreeNode(contactValue.value, contactValue.value, 'kix-icon-man-house');
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
        this.state.hasContact = true;
    }

    private async loadOrganisations(organisationIds: number[]): Promise<void> {
        this.state.loading = true;
        this.organisations = await KIXObjectService.loadObjects<Organisation>(
            KIXObjectType.ORGANISATION, organisationIds
        );

        const nodes = [];
        for (const o of this.organisations) {
            const displayValue = await LabelService.getInstance().getText(o);
            nodes.push(new TreeNode(o.ID, displayValue, 'kix-icon-man-house'));
        }
        this.state.nodes = nodes;

        this.state.currentNode = this.state.nodes.find((i) => i.id === this.state.primaryOrganisationId);
        this.organisationChanged([this.state.currentNode]);
        this.state.loading = false;
    }
}

module.exports = Component;
