import { Context } from "../../../model/components/context/Context";
import {
    WidgetConfiguration, WidgetType, KIXObject,
    KIXObjectType, TicketProperty, Customer, Contact,
    ContextDescriptor, IFormInstanceListener, FormField, FormFieldValue, FormContext
} from "../../../model";
import { EditTicketDialogContextConfiguration } from "./EditTicketDialogContextConfiguration";
import { FormService } from "../../form";
import { KIXObjectService } from "../../kix";

export class EditTicketDialogContext
    extends Context<EditTicketDialogContextConfiguration> implements IFormInstanceListener {

    public static CONTEXT_ID: string = 'edit-ticket-dialog-context';
    public formListenerId: string;

    private contact: Contact;
    private customer: Customer;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditTicketDialogContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async initContext(): Promise<void> {
        const formiId = await FormService.getInstance().getFormIdByContext(FormContext.EDIT, KIXObjectType.TICKET);
        this.formListenerId = 'EditTicketDialogContext';
        await FormService.getInstance().registerFormInstanceListener(formiId, this);
    }

    public updateForm(): void {
        return;
    }

    public async formValueChanged(formField: FormField, value: FormFieldValue<any>, oldValue: any): Promise<void> {
        if (formField.property === TicketProperty.CUSTOMER_ID) {
            if (value && value.value) {
                const customers = await KIXObjectService.loadObjects<Customer>(
                    KIXObjectType.CUSTOMER, [value.value]
                );
                if (customers && customers.length) {
                    this.customer = customers[0];
                    this.listeners.forEach(
                        (l) => l.objectChanged(
                            this.customer ? this.customer.CustomerID : null,
                            this.customer,
                            KIXObjectType.CUSTOMER
                        )
                    );
                }
            }
        } else if (formField.property === TicketProperty.CUSTOMER_USER_ID) {
            if (value && value.value) {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [value.value]
                );
                if (contacts && contacts.length) {
                    this.contact = contacts[0];
                    this.listeners.forEach(
                        (l) => l.objectChanged(
                            this.contact ? this.contact.ContactID : null,
                            this.contact,
                            KIXObjectType.CONTACT
                        )
                    );
                }
            }
        }
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.CUSTOMER) {
            object = this.customer;
        } else if (kixObjectType === KIXObjectType.CONTACT) {
            object = this.contact;
        }
        return object;
    }

    public reset(): void {
        this.contact = null;
        this.customer = null;
        this.initContext();
    }

}
