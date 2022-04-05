/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { UserPreference } from './UserPreference';
import { Tickets } from './Tickets';
import { Contact } from '../../customer/model/Contact';

export class User extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.USER;

    public UserID: number;
    public UserLogin: string;
    public UserComment: string;

    public UserFirstname: string;
    public UserLastname: string;
    public UserFullname: string;

    public Contact: Contact;

    public IsAgent: number;
    public IsCustomer: number;

    public Preferences: UserPreference[];
    public RoleIDs: number[];
    public Tickets: Tickets;

    public constructor(user?: User) {
        super(user);
        if (user) {
            this.UserID = Number(user.UserID);
            this.ObjectId = this.UserID;
            this.UserLogin = user.UserLogin;
            this.Preferences = user.Preferences ? user.Preferences.map((p) => new UserPreference(p)) : [];
            this.Tickets = user.Tickets;
            this.ValidID = user.ValidID;
            this.UserComment = user.UserComment;
            this.RoleIDs = user.RoleIDs ? user.RoleIDs : [];
            this.IsAgent = user.IsAgent;
            this.IsCustomer = user.IsCustomer;
            this.Contact = user.Contact ? new Contact(user.Contact) : null;
            this.UserFirstname = user.UserFirstname;
            this.UserLastname = user.UserLastname;
            this.UserFullname = user.UserFullname;

            if (this.Tickets) {
                this.Tickets.Owned = this.Tickets.Owned.map((t) => Number(t));
                this.Tickets.OwnedAndLocked = this.Tickets.OwnedAndLocked.map((t) => Number(t));
                this.Tickets.OwnedAndLockedAndUnseen = this.Tickets.OwnedAndLockedAndUnseen.map((t) => Number(t));
                this.Tickets.OwnedAndUnseen = this.Tickets.OwnedAndUnseen.map((t) => Number(t));
                this.Tickets.Watched = this.Tickets.Watched.map((t) => Number(t));
                this.Tickets.WatchedAndUnseen = this.Tickets.WatchedAndUnseen.map((t) => Number(t));
            }
        }
    }

    public getIdPropertyName(): string {
        return 'UserID';
    }
}
