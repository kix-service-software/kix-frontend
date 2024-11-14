/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectFormValueMapper } from '../../../../object-forms/model/ObjectFormValueMapper';
import { ObjectCommitHandler } from '../../../../object-forms/webapp/core/ObjectCommitHandler';
import { Contact } from '../../../model/Contact';

export class ContactObjectCommitHandler extends ObjectCommitHandler<Contact> {

    public constructor(protected objectValueMapper: ObjectFormValueMapper) {
        super(objectValueMapper, KIXObjectType.CONTACT);
    }

    public async prepareObject(
        contact: Contact, objectValueMapper?: ObjectFormValueMapper, forCommit: boolean = true
    ): Promise<Contact> {
        const newContact = await super.prepareObject(contact, objectValueMapper, forCommit);

        if (!newContact.User?.UserID && !newContact.User?.IsAgent && !newContact.User?.IsCustomer) {
            delete newContact.User;
        }

        return newContact;
    }

}