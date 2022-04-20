/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../../server/model/Error';
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
     * @returns true - the standard behavior should continue / false - the standard behavior should interrupt
     */
    public async postSubmit(context: Context, formId: string, objectId: string | number): Promise<boolean> {
        return true;
    }

    /**
     *
     * @param context
     * @param formId
     * @param error
     *
     * @returns true - the standard behavior should continue / false - the standard behavior should interrupt
     */
    public async postCatch(context: Context, formId: string, error: Error): Promise<boolean> {
        return true;
    }

}