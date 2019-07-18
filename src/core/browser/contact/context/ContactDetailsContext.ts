/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, Contact, KIXObjectType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions, ContactProperty
} from "../../../model";
import { KIXObjectService } from "../../kix";
import { EventService } from "../../event";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";
import { OrganisationContext } from "../../organisation";

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
        return new BreadcrumbInformation('kix-icon-organisation', [OrganisationContext.CONTEXT_ID], text);
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

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [ContactProperty.TICKET_STATS, 'Tickets']
        );

        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, [this.objectId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let contact: Contact;
        if (contacts && contacts.length) {
            contact = contacts[0];
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        return contact;
    }

}
