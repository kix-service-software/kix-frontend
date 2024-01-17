/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ContactProperty } from './ContactProperty';
import { FilterDataType } from '../../../model/FilterDataType';
import { InputFieldTypes } from '../../base-components/webapp/core/InputFieldTypes';
import { SearchOperator } from '../../search/model/SearchOperator';
import { UserProperty } from '../../user/model/UserProperty';

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
    public Email1: string;
    public Email2: string;
    public Email3: string;
    public Email4: string;
    public Email5: string;

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
            this.ObjectId = this.ID;
            this.AssignedConfigItems ||= [];

            this.User = contact.User ? new User(contact.User) : null;
            this.Tickets = contact.Tickets
                ? contact.Tickets.map((t) => new Ticket(t))
                : [];
        }
    }

    private static STRING_OPERATORS = [
        SearchOperator.EQUALS,
        SearchOperator.CONTAINS,
        SearchOperator.STARTS_WITH,
        SearchOperator.ENDS_WITH,
        SearchOperator.LIKE
    ];

    private static REFERENCE_OPERATORS = [
        SearchOperator.IN
    ];

    // tslint:disable: max-line-length
    // TODO: allow all possible (in backend) Operators for attributes - managers should limit
    public static SEARCH_PROPERTIES = [
        {
            Property: ContactProperty.EMAILS,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.CITY,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.FAX,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.STREET,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.FIRSTNAME,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.LASTNAME,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.COUNTRY,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.PRIMARY_ORGANISATION_ID,
            Operations: Contact.REFERENCE_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.OBJECT_REFERENCE
        },
        {
            Property: ContactProperty.PHONE,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.ZIP,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: ContactProperty.MOBILE,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: UserProperty.USER_LOGIN,
            Operations: Contact.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        }
    ];
    // tslint:enable

    public toString(): string {
        return `${this.Firstname} ${this.Lastname}`;
    }
}
