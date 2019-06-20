import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { Contact, KIXObjectType, CRUD, ContactProperty, FormField } from "../../model";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../model/UIComponentPermission";

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

    public async hasPermissions(field: FormField): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                hasPermissions = await this.checkPermissions('organisations');
                break;
            default:
        }
        return hasPermissions;
    }

    private async checkPermissions(resource: string, crud: CRUD[] = [CRUD.READ]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
    }
}
