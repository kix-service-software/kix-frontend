/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "./../KIXObject";
import { KIXObjectType } from "./../KIXObjectType";

export class MailAccount extends KIXObject {

    public KIXObjectType: KIXObjectType;

    public ObjectId: string | number;

    public ID: string | number;
    public Host: string;
    public Login: string;
    public Type: string;
    public IMAPFolder: string;
    public Trusted: number;
    public DispatchingBy: string;
    public QueueID: number;

    public constructor(mailAccount?: MailAccount) {
        super(mailAccount);
        if (mailAccount) {
            this.ID = mailAccount.ID;
            this.ObjectId = this.ID;
            this.Host = mailAccount.Host;
            this.Login = mailAccount.Login;
            this.Type = mailAccount.Type;
            this.IMAPFolder = mailAccount.IMAPFolder;
            this.Trusted = mailAccount.Trusted;
            this.DispatchingBy = mailAccount.DispatchingBy;
            this.QueueID = mailAccount.QueueID;
        }
    }

}
