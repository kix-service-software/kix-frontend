/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { GeneralCatalogItemProperty } from '../../../model/GeneralCatalogItemProperty';

export class EditGeneralCatalogDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-general-catalog-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = null, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        if (objectType === KIXObjectType.GENERAL_CATALOG_ITEM) {
            const objectId = this.getObjectId();
            if (objectId) {
                const objects = await KIXObjectService.loadObjects(
                    objectType, [objectId],
                    new KIXObjectLoadingOptions(
                        undefined, undefined, undefined, [GeneralCatalogItemProperty.PREFERENCES]
                    )
                );
                object = objects?.length ? objects[0] : null;
            }
        } else {
            object = super.getObject<O>(objectType, reload, changedProperties);
        }
        return object;
    }

}
