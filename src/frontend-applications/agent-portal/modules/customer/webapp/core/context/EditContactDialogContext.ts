/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { UserProperty } from '../../../../user/model/UserProperty';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { Contact } from '../../../model/Contact';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';

export class EditContactDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-contact-dialog-context';

    public async postInit(): Promise<void> {
        await super.postInit();

        const formId = await FormService.getInstance().getFormIdByContext(FormContext.EDIT, KIXObjectType.CONTACT);
        this.getFormManager().setFormId(formId, null, true);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = KIXObjectType.CONTACT,
        reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;

        if (objectType === KIXObjectType.CONTACT) {
            object = this.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
            if (!object) {
                object = await this.loadContact();
            }
        }

        return object;
    }

    private async loadContact(): Promise<Contact> {
        let contact: Contact;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [
                    KIXObjectProperty.DYNAMIC_FIELDS,
                    KIXObjectType.USER,
                    UserProperty.ROLE_IDS,
                    UserProperty.PREFERENCES
                ]
            );
            let contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [objectId], loadingOptions
            ).catch((): Contact[] => []);
            if (contacts?.length) {
                contact = KIXObjectService.createObjectInstance(KIXObjectType.CONTACT, contacts[0]);
            }
        }
        return contact;
    }

}
