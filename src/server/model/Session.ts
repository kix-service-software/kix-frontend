/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class Session {

    public CreateTime: string;
    public CreateTimeUnix: number;
    public Description: string;
    public LastRequestTime: string;
    public LastRequestTimeUnix: number;
    public TokenType: string;
    public RemoteIP: string;
    public UserID: number;
    public UserType: string;
    public ValidUntilTime: string;
    public ValidUntilTimeUnix: number;

}
