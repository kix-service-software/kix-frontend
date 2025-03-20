/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketRequest } from '../../base-components/webapp/core/ISocketRequest';
import { UserType } from '../../user/model/UserType';
import { MFAConfig } from './MFAConfig';

export class MFARequiredForUserRequest implements ISocketRequest {

    public clientRequestId: string;

    public constructor(
        public requestId: string,
        public login: string,
        public userType: UserType,
        public mfaConfig: MFAConfig
    ) { }

}