/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { KIXObject } from '../../../../model/kix/KIXObject';

export abstract class ExtendedObjectDialogService {

    public abstract objectType: KIXObject | string;

    /**
     *
     * @param context
     * @param formId
     * @param objectId
     *
     * @returns true if the standard behavoir should interrupt, false - the standard behavoir should continue
     */
    public async postSubmit(context: Context, formId: string, objectId: string | number): Promise<boolean> {
        return true;
    }

}