import { Context } from "../../../model/components/context/Context";
import {
    WidgetConfiguration, WidgetType, KIXObject,
    KIXObjectType, TicketProperty, Customer, Contact,
    ContextDescriptor, IFormInstanceListener, FormField, FormFieldValue, FormContext
} from "../../../model";
import { NewTicketDialogContextConfiguration } from "./NewTicketDialogContextConfiguration";
import { FormService } from "../../form";

export class NewTicketDialogContext
    extends Context<NewTicketDialogContextConfiguration> implements IFormInstanceListener {

    public static CONTEXT_ID: string = 'new-ticket-dialog-context';
    public formListenerId: string;

    private contact: Contact;
    private customer: Customer;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewTicketDialogContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async initContext(): Promise<void> {
        const formId = FormService.getInstance().getFormIdByContext(FormContext.NEW, KIXObjectType.TICKET);
        this.formListenerId = 'NewTicketDialogContext';
        await FormService.getInstance().registerFormInstanceListener(formId, this);
    }

    public updateForm(): void {
        return;
    }

    public formValueChanged(formField: FormField, value: FormFieldValue<any>, oldValue: any): void {
        if (formField.property === TicketProperty.CUSTOMER_ID) {
            this.customer = value.value ? (value.value as Customer) : null;
            this.listeners.forEach(
                (l) => l.objectChanged(
                    this.customer ? this.customer.CustomerID : null,
                    this.customer,
                    KIXObjectType.CUSTOMER
                )
            );
        } else if (formField.property === TicketProperty.CUSTOMER_USER_ID) {
            this.contact = value.value ? (value.value as Contact) : null;
            this.listeners.forEach(
                (l) => l.objectChanged(
                    this.contact ? this.contact.ContactID : null,
                    this.contact,
                    KIXObjectType.CONTACT
                )
            );
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
