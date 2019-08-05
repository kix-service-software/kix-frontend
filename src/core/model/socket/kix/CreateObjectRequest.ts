/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../kix";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { ISocketRequest } from "../ISocketRequest";

export class CreateObjectRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public objectType: KIXObjectType,
        public parameter: Array<[string, any]>,
        public createOptions?: KIXObjectSpecificCreateOptions
    ) { }

}
