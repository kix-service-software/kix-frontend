/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ObjectFormValueMapper } from '../../../../object-forms/model/ObjectFormValueMapper';
import { ObjectCommitHandler } from '../../../../object-forms/webapp/core/ObjectCommitHandler';
import { UserProperty } from '../../../../user/model/UserProperty';
import { Contact } from '../../../model/Contact';
import { NewContactDialogContext } from '../context/NewContactDialogContext';

export class ContactObjectCommitHandler extends ObjectCommitHandler<Contact> {

    public constructor(protected objectValueMapper: ObjectFormValueMapper) {
        super(objectValueMapper, KIXObjectType.CONTACT);
    }

    public async commitObject(): Promise<string | number> {
        const id = await super.commitObject();
        const context = ContextService.getInstance().getActiveContext<NewContactDialogContext>();
        if (context) {
            context.contactId = Number(id);
        }
        return id;
    }

    public async prepareObject(
        contact: Contact, objectValueMapper?: ObjectFormValueMapper, forCommit: boolean = true
    ): Promise<Contact> {
        const newContact = await super.prepareObject(contact, objectValueMapper, forCommit);

        if (!newContact.User?.UserID && !newContact.User?.IsAgent && !newContact.User?.IsCustomer) {
            delete newContact.User;
        }

        if (Array.isArray(newContact.User?.Preferences)) {
            const userAccessFormValue = objectValueMapper.findFormValue(UserProperty.USER_ACCESS);
            const preferencesFormValue = userAccessFormValue?.findFormValue(UserProperty.PREFERENCES);
            newContact.User.Preferences = newContact.User.Preferences.filter(
                (pref) => preferencesFormValue.formValues.some(
                    (formValue) => formValue.getObjectProperty('ID') === pref.ID
                )
            );
        }

        return newContact;
    }

}