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
import { Ticket } from '../../ticket/model/Ticket';
import { TicketStats } from './TicketStats';
import { User } from '../../user/model/User';

export class Contact extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public ID: number;

    public AssignedUserID: number;

    public AssignedConfigItems: number[];

    public User: User;

    public Firstname: string;

    public Fullname: string;

    public Lastname: string;

    public City: string;

    public Street: string;

    public Comment: string;

    public Country: string;

    public Email: string;

    public Fax: string;

    public Mobile: string;

    public Phone: string;

    public PrimaryOrganisationID: number;

    public OrganisationIDs: number[];

    public Title: string;

    public Zip: string;

    public TicketStats: TicketStats;

    public Tickets: Ticket[];

    public constructor(contact?: Contact) {
        super(contact);

        if (contact) {
            this.ID = contact.ID;
            this.ObjectId = this.ID;
            this.AssignedUserID = contact.AssignedUserID;
            this.AssignedConfigItems = contact.AssignedConfigItems ? contact.AssignedConfigItems : [];
            this.Firstname = contact.Firstname;
            this.Fullname = contact.Fullname;
            this.Lastname = contact.Lastname;
            this.City = contact.City;
            this.Street = contact.Street;
            this.Comment = contact.Comment;
            this.Country = contact.Country;
            this.Email = contact.Email;
            this.Fax = contact.Fax;
            this.Mobile = contact.Mobile;
            this.Phone = contact.Phone;
            this.PrimaryOrganisationID = contact.PrimaryOrganisationID;
            this.OrganisationIDs = contact.OrganisationIDs;
            this.Title = contact.Title;
            this.Zip = contact.Zip;
            this.TicketStats = contact.TicketStats;

            this.User = contact.User ? new User(contact.User) : null;
            this.Tickets = contact.Tickets
                ? contact.Tickets.map((t) => new Ticket(t))
                : [];
        }
    }

}
