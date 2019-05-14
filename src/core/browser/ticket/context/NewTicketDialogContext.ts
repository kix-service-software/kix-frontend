import { Context } from "../../../model/components/context/Context";
import {
    KIXObject, KIXObjectType, TicketProperty, Organisation, Contact,
    IFormInstanceListener, FormField, FormFieldValue, FormContext
} from "../../../model";
import { FormService } from "../../form";
import { KIXObjectService } from "../../kix";

export class NewTicketDialogContext extends Context implements IFormInstanceListener {

    public static CONTEXT_ID: string = 'new-ticket-dialog-context';
    public formListenerId: string;

    private contact: Contact;
    private organisation: Organisation;

    public async initContext(): Promise<void> {
        this.contact = null;
        this.organisation = null;
        const formId = await FormService.getInstance().getFormIdByContext(FormContext.NEW, KIXObjectType.TICKET);
        this.formListenerId = 'NewTicketDialogContext';
        await FormService.getInstance().registerFormInstanceListener(formId, this);
    }

    public updateForm(): void {
        return;
    }

    public async formValueChanged(formField: FormField, value: FormFieldValue<any>, oldValue: any): Promise<void> {
        if (formField && formField.property === TicketProperty.ORGANISATION_ID) {
            if (value && value.value) {
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, [value.value]
                );
                if (organisations && organisations.length) {
                    this.organisation = organisations[0];
                    this.listeners.forEach(
                        (l) => l.objectChanged(
                            this.organisation ? this.organisation.ID : null,
                            this.organisation,
                            KIXObjectType.ORGANISATION
                        )
                    );
                }
            }
        } else if (formField && formField.property === TicketProperty.CONTACT_ID) {
            if (value && value.value) {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [value.value]
                );
                if (contacts && contacts.length) {
                    this.contact = contacts[0];
                    this.listeners.forEach(
                        (l) => l.objectChanged(
                            this.contact ? this.contact.ID : null,
                            this.contact,
                            KIXObjectType.CONTACT
                        )
                    );
                }
            }
        }
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.ORGANISATION) {
            object = this.organisation;
        } else if (kixObjectType === KIXObjectType.CONTACT) {
            object = this.contact;
        }
        return object;
    }
}
