/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../server/model/Error';


export class PermissionError extends Error {

    public constructor(
        error: Error,
        public resource: string,
        public method: string
    ) {
        super(error.Code, error.Message, error.StatusCode);
    }

}
