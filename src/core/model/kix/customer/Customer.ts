import { CustomerSource } from "./CustomerSource";
import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "..";
import { Contact } from "../contact";
import { Ticket, TicketStats } from "../ticket";

export class Customer extends KIXObject<Customer> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CUSTOMER;

    public CustomerID: string;

    public SourceID: string;

    public CustomerCompanyName: string;

    public CustomerCompanyURL: string;

    public CustomerCompanyZIP: string;

    public CustomerCompanyCity: string;

    public CustomerCompanyStreet: string;

    public CustomerCompanyCountry: string;

    public CustomerCompanyComment: string;

    public ValidID: number;

    public CreateBy: number;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public DisplayValue: string;

    public Contacts: Array<string | Contact>;

    public Tickets: Array<number | Ticket>;

    public TicketStats: TicketStats;

    // UI Properties

    public customerSourceMap: Array<[string, Array<[string, string]>]> = [];

    public constructor(customer?: Customer) {
        super();

        if (customer) {
            this.CustomerID = customer.CustomerID;
            this.ObjectId = this.CustomerID;
            this.SourceID = customer.SourceID;
            this.CustomerCompanyName = customer.CustomerCompanyName;
            this.CustomerCompanyURL = customer.CustomerCompanyURL;
            this.CustomerCompanyZIP = customer.CustomerCompanyZIP;
            this.CustomerCompanyCity = customer.CustomerCompanyCity;
            this.CustomerCompanyStreet = customer.CustomerCompanyStreet;
            this.CustomerCompanyCountry = customer.CustomerCompanyCountry;
            this.CustomerCompanyComment = customer.CustomerCompanyComment;
            this.ValidID = customer.ValidID;
            this.CreateBy = customer.CreateBy;
            this.CreateTime = customer.CreateTime;
            this.ChangeBy = customer.ChangeBy;
            this.ChangeTime = customer.ChangeTime;
            this.DisplayValue = customer.DisplayValue;
            this.Contacts = customer.Contacts;
            this.Tickets = customer.Tickets;
            this.TicketStats = customer.TicketStats;
            this.customerSourceMap = customer.customerSourceMap || [];
        }
    }

    public getCustomerInfoData(): Array<[string, Array<[string, string]>]> {
        const customerInfoValue = [];
        if (this.customerSourceMap) {
            this.customerSourceMap.forEach((groupTuple) => {
                const attributes = [];
                groupTuple[1].forEach((attributeTuple) => {
                    attributes.push([attributeTuple[1], this[attributeTuple[1]]]);
                });
                customerInfoValue.push([groupTuple[0], attributes]);
            });
        }
        return customerInfoValue;
    }

    public equals(customer: Customer): boolean {
        return customer && customer.CustomerID === this.CustomerID;
    }

    public getIdPropertyName(): string {
        return 'CustomerID';
    }

}
