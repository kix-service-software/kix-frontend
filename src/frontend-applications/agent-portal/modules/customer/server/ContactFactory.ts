/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "../../../server/model/ObjectFactory";
import { Contact } from "../model/Contact";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";

export class ContactFactory extends ObjectFactory<Contact> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.CONTACT;
    }

    public async create(contact?: Contact): Promise<Contact> {
        const newContact = new Contact(contact);
        return newContact;
    }

}
