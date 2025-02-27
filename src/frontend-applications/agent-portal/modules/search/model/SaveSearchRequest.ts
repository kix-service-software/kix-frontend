/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketRequest } from '../../../modules/base-components/webapp/core/ISocketRequest';
import { SearchCache } from './SearchCache';

export class SaveSearchRequest implements ISocketRequest {

    public constructor(
        public requestId: string,
        public clientRequestId: string,
        public search: SearchCache,
        public share?: boolean
    ) { }

}
