/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../../model/Context';
import { KIXObject } from '../../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../../../../model/ConfigItemClass';

export class EditConfigItemClassDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-config-item-class-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS
    ): Promise<O> {
        let object;
        const classId = this.getObjectId();
        if (classId) {
            const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['CurrentDefinition']);

            const objects = await KIXObjectService.loadObjects<ConfigItemClass>(
                KIXObjectType.CONFIG_ITEM_CLASS, [classId], loadingOptions
            );
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }
}
