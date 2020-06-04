/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketRequest } from "../../../modules/base-components/webapp/core/ISocketRequest";
import { Webform } from "./Webform";

export class SaveWebformRequest implements ISocketRequest {

    public constructor(
        public requestId: string,
        public clientRequestId: string,
        public webform: Webform,
        public webformId?: number
    ) { }

}
