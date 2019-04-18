import {
    Context, Contact, KIXObjectType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions
} from "../../../model";
import { CustomerContext } from "../../customer";
import { KIXObjectService } from "../../kix";
import { EventService } from "../../event";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";

export class ContactDetailsContext extends Context {

    public static CONTEXT_ID: string = 'contact-details';

    public getIcon(): string {
        return 'kix-icon-man-bubble';
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        return LabelService.getInstance().getText(await this.getObject<Contact>(), short, short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Contact>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation('kix-icon-customers', [CustomerContext.CONTEXT_ID], text);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONTACT, reload: boolean = false
    ): Promise<O> {
        const object = await this.loadContact() as any;

        if (reload) {
            this.listeners.forEach((l) => l.objectChanged(this.getObjectId(), object, KIXObjectType.CONTACT));
        }

        return object;
    }

    private async loadContact(): Promise<Contact> {
        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load Contact ...' }
            );
        }, 500);

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, null, ['TicketStats', 'Tickets']);

        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, [this.objectId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let contact;
        if (contacts && contacts.length) {
            contact = contacts[0];
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        return contact;
    }

}
