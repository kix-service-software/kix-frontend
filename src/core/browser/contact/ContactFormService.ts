import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { Contact, KIXObjectType, ContactProperty } from "../../model";
import { CustomerService } from "../customer";

export class ContactFormService extends KIXObjectFormService<Contact> {

    private static INSTANCE: ContactFormService;

    public static getInstance(): ContactFormService {
        if (!ContactFormService.INSTANCE) {
            ContactFormService.INSTANCE = new ContactFormService();
        }
        return ContactFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CONTACT;
    }

    protected async getValue(property: string, value: any, kixObject: Contact): Promise<any> {
        if (value) {
            switch (property) {
                case ContactProperty.USER_CUSTOMER_ID:
                    const customers = await CustomerService.getInstance().loadObjects(
                        KIXObjectType.CUSTOMER, [value], null
                    );
                    value = customers && !!customers.length ? customers[0] : null;
                    break;
                default:
            }
        }
        return value;
    }
}
