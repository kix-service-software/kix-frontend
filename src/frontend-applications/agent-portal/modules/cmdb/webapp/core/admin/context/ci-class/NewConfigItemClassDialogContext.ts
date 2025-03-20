/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectService } from '../../../../../../base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../../../../model/ConfigItemClass';


export class NewConfigItemClassDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-config-item-class-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS
    ): Promise<O> {
        let object;
        const classId = this.getObjectId();
        if (classId) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = ['CurrentDefinition'];
            loadingOptions.cacheType = `${KIXObjectType.CONFIG_ITEM_CLASS}_DEFINITION`;

            const objects = await KIXObjectService.loadObjects<ConfigItemClass>(
                KIXObjectType.CONFIG_ITEM_CLASS, [classId], loadingOptions
            );
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

}
