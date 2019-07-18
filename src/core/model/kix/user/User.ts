/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { Tickets } from "./Tickets";
import { UserPreference } from "./UserPreference";

export class User extends KIXObject<User> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.USER;

    public UserID: number;
    public UserLogin: string;
    public UserTitle: string;
    public UserFirstname: string;
    public UserLastname: string;
    public UserFullname: string;
    public UserEmail: string;
    public UserPhone: string;
    public UserMobile: string;
    public UserComment: string;

    public Preferences: UserPreference[];
    public RoleIDs: number[];
    public Tickets: Tickets;

    public constructor(user?: User) {
        super(user);
        if (user) {
            this.UserID = Number(user.UserID);
            this.ObjectId = this.UserID;
            this.UserLogin = user.UserLogin;
            this.UserTitle = user.UserTitle;
            this.UserFirstname = user.UserFirstname;
            this.UserLastname = user.UserLastname;
            this.UserFullname = user.UserFullname;
            this.Preferences = user.Preferences ? user.Preferences.map((p) => new UserPreference(p)) : [];
            this.Tickets = user.Tickets;
            this.ValidID = user.ValidID;
            this.UserEmail = user.UserEmail;
            this.UserPhone = user.UserPhone;
            this.UserMobile = user.UserMobile;
            this.UserComment = user.UserComment;
            this.RoleIDs = user.RoleIDs ? user.RoleIDs : [];

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

    public equals(user: User): boolean {
        return user.UserID === this.UserID;
    }

    public getIdPropertyName(): string {
        return 'UserID';
    }
}
