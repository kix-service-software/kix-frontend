/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [
                    ContactProperty.USER
                ]
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

}
