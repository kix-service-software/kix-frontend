/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketRequest } from './ISocketRequest';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';

export class LoadObjectsRequest implements ISocketRequest {

    public constructor(
        public requestId: string,
        public clientRequestId: string,
        public objectType: KIXObjectType | string,
        public objectIds: Array<string | number> = null,
        public loadingOptions: KIXObjectLoadingOptions = null,
        public objectLoadingOptions: KIXObjectSpecificLoadingOptions = null
    ) { }

}
