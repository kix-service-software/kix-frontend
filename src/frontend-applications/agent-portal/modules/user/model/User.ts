/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { UserPreference } from './UserPreference';
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

    public UsageContext: number;
    public IsAgent: number;
    public IsCustomer: number;

    public Preferences: UserPreference[];
    public RoleIDs: number[];

    public constructor(user?: User) {
        super(user);
        if (user) {
            this.UserID = Number(user.UserID);
            this.ObjectId = this.UserID;
            this.UserLogin = user.UserLogin;
            this.Preferences = user.Preferences ? user.Preferences.map((p) => new UserPreference(p)) : [];
            this.ValidID = user.ValidID;
            this.UserComment = user.UserComment;
            this.RoleIDs = user.RoleIDs ? user.RoleIDs : [];
            this.IsAgent = user.IsAgent;
            this.IsCustomer = user.IsCustomer;
            this.Contact = user.Contact ? new Contact(user.Contact) : null;
            this.UserFirstname = user.UserFirstname;
            this.UserLastname = user.UserLastname;
            this.UserFullname = user.UserFullname;
        }
    }

    public getIdPropertyName(): string {
        return 'UserID';
    }

    public toString(): string {
        if (this.Contact) {
            return this.Contact ? `${this.Contact.Firstname} ${this.Contact.Lastname}` : this.UserLogin;
        } else {
            return `${this.UserFirstname}, ${this.UserLastname}`;
        }
    }

}
