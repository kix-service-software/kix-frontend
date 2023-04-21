/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketStats } from './TicketStats';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { Contact } from './Contact';
import { Ticket } from '../../ticket/model/Ticket';
import { SearchOperator } from '../../search/model/SearchOperator';
import { OrganisationProperty } from './OrganisationProperty';
import { FilterDataType } from '../../../model/FilterDataType';
import { InputFieldTypes } from '../../base-components/webapp/core/InputFieldTypes';

export class Organisation extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public ID: number;

    public City: string;

    public Comment: string;

    public Country: string;

    public Name: string;

    public Number: string;

    public Street: string;

    public Url: string;

    public Zip: string;

    public Contacts: Contact[];

    public Tickets: Ticket[];

    public TicketStats: TicketStats;

    public AssignedConfigItems: number[];

    public constructor(organisation?: Organisation) {
        super(organisation);

        if (organisation) {
            this.ID = organisation.ID;
            this.ObjectId = this.ID;

            this.City = organisation.City;
            this.Comment = organisation.Comment;
            this.Country = organisation.Country;
            this.Name = organisation.Name;
            this.Number = organisation.Number;
            this.Street = organisation.Street;
            this.Url = organisation.Url;
            this.Zip = organisation.Zip;
            this.TicketStats = organisation.TicketStats;

            this.Contacts = organisation.Contacts
                ? organisation.Contacts.map((c) => new Contact(c))
                : [];

            this.Tickets = organisation.Tickets
                ? organisation.Tickets.map((t) => new Ticket(t))
                : [];

            this.AssignedConfigItems = organisation.AssignedConfigItems ? organisation.AssignedConfigItems : [];
        }
    }

    private static NUMBER_OPERATORS = [
        SearchOperator.EQUALS,
        SearchOperator.LESS_THAN,
        SearchOperator.GREATER_THAN,
        SearchOperator.LESS_THAN_OR_EQUAL,
        SearchOperator.GREATER_THAN_OR_EQUAL,
        SearchOperator.BETWEEN
    ];

    private static DATETIME_OPERATORS = [
        SearchOperator.LESS_THAN,
        SearchOperator.GREATER_THAN,
        SearchOperator.LESS_THAN_OR_EQUAL,
        SearchOperator.GREATER_THAN_OR_EQUAL,
        SearchOperator.BETWEEN,
        SearchOperator.WITHIN_THE_LAST,
        SearchOperator.WITHIN_THE_NEXT,
        SearchOperator.MORE_THAN_AGO,
        SearchOperator.IN_MORE_THAN,
        SearchOperator.LESS_THAN_AGO,
        SearchOperator.IN_LESS_THAN
    ];

    private static STRING_OPERATORS = [
        SearchOperator.EQUALS,
        SearchOperator.CONTAINS,
        SearchOperator.STARTS_WITH,
        SearchOperator.ENDS_WITH,
        SearchOperator.LIKE
    ];

    // tslint:disable: max-line-length
    // TODO: allow all possible (in backend) Operators for attributes - managers should limit
    public static SEARCH_PROPERTIES = [
        {
            Property: OrganisationProperty.NAME,
            Operations: Organisation.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: OrganisationProperty.CITY,
            Operations: Organisation.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: OrganisationProperty.NUMBER,
            Operations: Organisation.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: OrganisationProperty.STREET,
            Operations: Organisation.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: OrganisationProperty.URL,
            Operations: Organisation.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: OrganisationProperty.ZIP,
            Operations: Organisation.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        },
        {
            Property: OrganisationProperty.COUNTRY,
            Operations: Organisation.STRING_OPERATORS,
            DataType: FilterDataType.STRING,
            InputType: InputFieldTypes.TEXT
        }
    ];
    // tslint:enable

    public toString(): string {
        return this.Name;
    }

}
