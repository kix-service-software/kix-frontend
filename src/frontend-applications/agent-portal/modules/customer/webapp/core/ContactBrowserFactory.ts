/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from '../../../../modules/base-components/webapp/core/IKIXObjectFactory';
import { Contact } from '../../model/Contact';

export class ContactBrowserFactory implements IKIXObjectFactory<Contact> {

    private static INSTANCE: ContactBrowserFactory;

    public static getInstance(): ContactBrowserFactory {
        if (!ContactBrowserFactory.INSTANCE) {
            ContactBrowserFactory.INSTANCE = new ContactBrowserFactory();
        }
        return ContactBrowserFactory.INSTANCE;
    }

    public async create(contact: Contact): Promise<Contact> {
        return new Contact(contact);
    }

}
