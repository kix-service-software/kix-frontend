import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { Contact, KIXObjectType } from "../../model";

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
}
