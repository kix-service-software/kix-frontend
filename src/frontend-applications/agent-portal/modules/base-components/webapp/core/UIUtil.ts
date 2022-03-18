/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextService } from './ContextService';
import { ContextMode } from '../../../../model/ContextMode';

export class UIUtil {

    public static async getEditObjectId(type: KIXObjectType | string): Promise<number> {
        const dialogContext = ContextService.getInstance().getActiveContext();
        const dialogContextMode = dialogContext?.descriptor?.contextMode;
        const isEditDialog = dialogContextMode && (
            dialogContextMode === ContextMode.EDIT ||
            dialogContextMode === ContextMode.EDIT_ADMIN
        ) ? true : false;

        // check if "edit dialog" context supports objecttype
        const contextObjectType = isEditDialog && dialogContext?.descriptor?.kixObjectTypes?.length === 1 ?
            dialogContext.descriptor.kixObjectTypes[0] : null;
        const object = type && contextObjectType && type === contextObjectType ?
            await dialogContext.getObject(type) : null;
        return object && object.KIXObjectType === type
            ? Number(object.ObjectId)
            : null;
    }

}
