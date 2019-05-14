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
            formValueChanged: async (formField: FormField, value: FormFieldValue<any>) => {
                if (formField && formField.property === TicketProperty.CONTACT_ID) {
                    if (value.value) {
                        const contacts = await KIXObjectService.loadObjects<Contact>(
                            KIXObjectType.CONTACT, [value.value]
                        );
                        if (contacts && contacts.length) {
                            const contact = contacts[0];
                            this.state.primaryOrganisationId = contact.PrimaryOrganisationID;
                            this.loadOrganisation(contact.OrganisationIDs);
                            this.state.hasContact = true;
                        }
                    } else {
                        this.state.currentNode = null;
                        this.state.hasContact = false;
                        this.state.nodes = [];
                        super.provideValue(null);
                    }
                }
            },
            updateForm: () => { return; }
        });
        this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [this.state.defaultValue.value]
            );

            if (organisations && organisations.length) {
                const organisation = organisations[0];

                const displayValue = await LabelService.getInstance().getText(organisation);

                this.state.currentNode = new TreeNode(
                    organisation.ID, displayValue, 'kix-icon-man-bubble'
                );
                this.state.nodes = [this.state.currentNode];
                super.provideValue(organisation.ID);
            }
        }
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
    }

    private async loadOrganisation(organisationIds: number[]): Promise<void> {
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

    private organisationChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
