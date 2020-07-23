/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextService } from './ContextService';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';

export class UIUtil {

    public static async getEditObjectId(type: KIXObjectType | string): Promise<number> {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        const dialogContextMode = dialogContext ? dialogContext.getDescriptor().contextMode : null;
        const isEditDialog = dialogContextMode
            && dialogContextMode === ContextMode.EDIT
            || dialogContextMode === ContextMode.EDIT_ADMIN ?
            true : false;
        const object = context && isEditDialog ? await context.getObject() : null;
        return object && object.KIXObjectType === type
            ? Number(object.ObjectId)
            : null;
    }

}
