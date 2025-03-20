/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MFAToken } from '../../../multifactor-authentication/model/MFAToken';
import { UserType } from '../../../user/model/UserType';

export class LoginRequest {

        public constructor(
                public userName: string,
                public password: string,
                public userType: UserType,
                public negotiateToken: string,
                public redirectUrl: string,
                public mfaToken: MFAToken,
                public requestId: string,
                public clientRequestId: string
        ) { }

}
