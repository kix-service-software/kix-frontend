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
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [KIXObjectProperty.DYNAMIC_FIELDS, KIXObjectType.USER, UserProperty.PREFERENCES]
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions)
                .catch(() => []);
            object = objects?.length ? objects[0] : null;
        }
        return object;
    }

}
