/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
