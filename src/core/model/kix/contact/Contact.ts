import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "..";
import { Ticket, TicketStats } from "../ticket";

export class Contact extends KIXObject<Contact> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONTACT;

    public ContactID: string;

    public SourceID: string;

    public UserLogin: string;

    public UserPhone: string;

    public UserCustomerID: string;

    public UserCountry: string;

    public UserLastname: string;

    public UserFirstname: string;

    public UserTitle: string;

    public UserFax: string;

    public UserMobile: string;

    public UserComment: string;

    public UserStreet: string;

    public UserEmail: string;

    public UserCity: string;

    public UserZip: string;

    public ValidID: number;

    public CreateBy: number;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public DisplayValue: string;

    public UserCustomerIDs: string[];

    public Tickets: Array<number | Ticket>;

    public TicketStats: TicketStats;

    // UI Properties

    public contactSourceMap: Array<[string, Array<[string, string]>]> = [];

    public constructor(contact?: Contact) {
        super();

        if (contact) {
            this.ContactID = contact.ContactID;
            this.ObjectId = this.ContactID;
            this.SourceID = contact.SourceID;
            this.UserLogin = contact.UserLogin;
            this.UserPhone = contact.UserPhone;
            this.UserCustomerID = contact.UserCustomerID;
            this.UserCountry = contact.UserCountry;
            this.UserLastname = contact.UserLastname;
            this.UserFirstname = contact.UserFirstname;
            this.UserTitle = contact.UserTitle;
            this.UserFax = contact.UserFax;
            this.UserMobile = contact.UserMobile;
            this.UserComment = contact.UserComment;
            this.UserStreet = contact.UserStreet;
            this.UserEmail = contact.UserEmail;
            this.UserCity = contact.UserCity;
            this.UserZip = contact.UserZip;
            this.ValidID = contact.ValidID;
            this.CreateBy = contact.CreateBy;
            this.CreateTime = contact.CreateTime;
            this.ChangeBy = contact.ChangeBy;
            this.ChangeTime = contact.ChangeTime;
            this.DisplayValue = contact.DisplayValue;
            this.UserCustomerIDs = contact.UserCustomerIDs;
            this.Tickets = contact.Tickets;
            this.TicketStats = contact.TicketStats;
            this.contactSourceMap = contact.contactSourceMap;
        }
    }

    public getContactInfoData(): Array<[string, Array<[string, string]>]> {
        const contactInfoValue = [];
        if (this.contactSourceMap) {
            this.contactSourceMap.forEach((groupTuple) => {
                const attributes = [];
                groupTuple[1].forEach((attributeTuple) => {
                    attributes.push([attributeTuple[1], this[attributeTuple[1]]]);
                });
                contactInfoValue.push([groupTuple[0], attributes]);
            });
        }
        return contactInfoValue;
    }

    public equals(contact: Contact): boolean {
        return contact && contact.ContactID === this.ContactID;
    }

    public getIdPropertyName(): string {
        return 'ContactID';
    }

}
