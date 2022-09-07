/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UserType } from './UserType';

export class UserLogin {

    public UserLogin: string;
    public Password: string;
    public UserType: UserType;
    public NegotiateToken: string;

    public constructor(userName: string, password: string, userType: UserType, negotiateToken: string) {
        this.UserLogin = userName;
        this.Password = password;
        this.UserType = userType;
        this.NegotiateToken = negotiateToken;
    }

}
