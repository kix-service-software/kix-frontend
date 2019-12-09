/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { Contact, KIXObjectType, ContactProperty } from "../../model";
import { FormFieldConfiguration } from "../../model/components/form/configuration";

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

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                hasPermissions = await this.checkPermissions('organisations');
                break;
            default:
        }
        return hasPermissions;
    }
}
