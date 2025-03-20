/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../model/DynamicField';
import { DynamicFieldProperty } from '../../model/DynamicFieldProperty';

export class NewDynamicFieldDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-dynamic-field-dialog-context';

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD
    ): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.DYNAMIC_FIELD) {
            const fieldId = this.getObjectId();
            if (fieldId) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null, [DynamicFieldProperty.CONFIG]
                );
                const objects = await KIXObjectService.loadObjects<DynamicField>(
                    KIXObjectType.DYNAMIC_FIELD, [fieldId], loadingOptions
                );
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }

}
