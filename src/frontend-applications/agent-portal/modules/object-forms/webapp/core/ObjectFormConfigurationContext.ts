/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { Ticket } from '../../../ticket/model/Ticket';

export class ObjectFormConfigurationContext extends Context {

    public static CONTEXT_ID = 'ObjectFormConfigurationContext';

    public async getObject<O extends KIXObject>(
        objectType?: string, reload?: boolean, changedProperties?: string[]
    ): Promise<O> {
        return new Ticket() as any;
    }

}