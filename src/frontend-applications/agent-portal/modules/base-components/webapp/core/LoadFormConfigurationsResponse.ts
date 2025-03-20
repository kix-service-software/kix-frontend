/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketResponse } from './ISocketResponse';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class LoadFormConfigurationsResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public formIDsWithContext: Array<[FormContext, KIXObjectType | string, string]>
    ) { }

}
