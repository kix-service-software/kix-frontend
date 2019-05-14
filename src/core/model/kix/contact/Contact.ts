import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "..";
import { TicketStats, Ticket } from "../ticket";

export class Contact extends KIXObject<Contact> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public ID: number;

    public Firstname: string;

    public Lastname: string;

    public Login: string;

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
            this.Firstname = contact.Firstname;
            this.Lastname = contact.Lastname;
            this.Login = contact.Login;
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

            this.Tickets = contact.Tickets
                ? contact.Tickets.map((t) => new Ticket(t))
                : [];
        }
    }

}
