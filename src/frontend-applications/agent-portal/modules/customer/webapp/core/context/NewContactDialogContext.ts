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
import { ContactProperty } from '../../../model/ContactProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { Organisation } from '../../../model/Organisation';
import { Contact } from '../../../model/Contact';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { UserProperty } from '../../../../user/model/UserProperty';

export class NewContactDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-contact-dialog-context';

    public contactId: number = null;

    public async postInit(): Promise<void> {
        await super.postInit();

        const formInstance = await this.getFormManager().getFormInstance();

        const organisation = this.getAdditionalInformation(KIXObjectType.ORGANISATION) as Organisation;
        if (formInstance && organisation) {
            formInstance.provideFormFieldValuesForProperties(
                [[ContactProperty.PRIMARY_ORGANISATION_ID, organisation.ID]], undefined, undefined, false
            );
        }
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONTACT, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let contact: Contact;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, [ContactProperty.USER, UserProperty.ROLE_IDS]
            );
            const objects = await KIXObjectService.loadObjects<Contact>(
                objectType, [objectId], loadingOptions
            ).catch((): Contact[] => []);
            if (objects?.length) {
                contact = objects[0];
                delete contact.ID;
                delete contact.User?.UserID;
                delete contact.AssignedUserID;
                delete contact.Email;
                delete contact.Email1;
                delete contact.Email2;
                delete contact.Email3;
                delete contact.Email4;
                delete contact.Email5;
            }
        } else {
            contact = new Contact();
        }
        return contact as any;
    }

    public async getDisplayText(): Promise<string> {
        let displayText = await super.getDisplayText();
        if (this.getAdditionalInformation(AdditionalContextInformation.DUPLICATE)) {
            const translatedNew = await TranslationService.translate('Translatable#New');
            displayText = `${translatedNew} ${displayText}`;
        }
        return displayText;
    }

}
