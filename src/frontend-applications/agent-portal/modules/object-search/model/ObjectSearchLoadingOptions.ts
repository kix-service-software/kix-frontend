/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ObjectSearchLoadingOptions extends KIXObjectSpecificLoadingOptions {

    public static id = 'ObjectSearchLoadingOptions';

    public constructor(
        public objectType: string | KIXObjectType
    ) {
        super();
    }

}
