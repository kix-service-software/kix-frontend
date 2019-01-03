import { SearchDefinition, SearchResultCategory } from "../kix";
import {
    KIXObjectType, TicketProperty, InputFieldTypes, FilterCriteria,
    KIXObjectLoadingOptions, FilterDataType, FilterType, ArchiveFlag
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";

export class TicketSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.TICKET);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(null, criteria, null, null, null, ['Links'], ['Links']);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        return [
            [SearchProperty.FULLTEXT, null],
            [TicketProperty.TICKET_NUMBER, null],
            [TicketProperty.TITLE, null],
            [TicketProperty.CUSTOMER_ID, null],
            [TicketProperty.CUSTOMER_USER_ID, null],
            [TicketProperty.TYPE_ID, null],
            [TicketProperty.STATE_ID, null],
            [TicketProperty.QUEUE_ID, null],
            [TicketProperty.SERVICE_ID, null],
            [TicketProperty.SLA_ID, null],
            [TicketProperty.PRIORITY_ID, null],
            [TicketProperty.LOCK_ID, null],
            [TicketProperty.AGE, null],
            [TicketProperty.CREATE_TIME, null],
            [TicketProperty.CLOSE_TIME, null],
            [TicketProperty.CHANGE_TIME, null],
            [TicketProperty.PENDING_TIME, null],
            [TicketProperty.LAST_CHANGE_TIME, null],
            [TicketProperty.ESCALATION_TIME, null],
            [TicketProperty.ESCALATION_RESPONSE_TIME, null],
            [TicketProperty.ESCALATION_UPDATE_TIME, null],
            [TicketProperty.ESCALATION_SOLUTIONS_TIME, null]
        ];
    }

    public async getOperations(property: string): Promise<SearchOperator[]> {
        let operations: SearchOperator[] = [];

        const numberOperators = [
            SearchOperator.EQUALS,
            SearchOperator.IN
        ];

        const stringOperators = [
            SearchOperator.EQUALS,
            SearchOperator.STARTS_WITH,
            SearchOperator.ENDS_WITH,
            SearchOperator.CONTAINS,
            SearchOperator.LIKE
        ];

        const dateTimeOperators = [
            SearchOperator.EQUALS,
            SearchOperator.LESS_THAN,
            SearchOperator.LESS_THAN_OR_EQUAL,
            SearchOperator.GREATER_THAN,
            SearchOperator.GREATER_THAN_OR_EQUAL
        ];

        switch (property) {
            case TicketProperty.TICKET_NUMBER:
            case TicketProperty.TITLE:
            case TicketProperty.CUSTOMER_ID:
            case TicketProperty.CUSTOMER_USER_ID:
                operations = stringOperators;
                break;
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.SERVICE_ID:
            case TicketProperty.SLA_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.LOCK_ID:
                operations = numberOperators;
                break;
            case TicketProperty.AGE:
            case TicketProperty.CREATE_TIME:
            case TicketProperty.CLOSE_TIME:
            case TicketProperty.CHANGE_TIME:
            case TicketProperty.PENDING_TIME:
            case TicketProperty.LAST_CHANGE_TIME:
            case TicketProperty.ESCALATION_TIME:
            case TicketProperty.ESCALATION_RESPONSE_TIME:
            case TicketProperty.ESCALATION_UPDATE_TIME:
            case TicketProperty.ESCALATION_SOLUTIONS_TIME:
                operations = dateTimeOperators;
                break;
            default:
                operations = [];
        }

        return operations;
    }

    public async getInputFieldType(property: string, parameter?: Array<[string, any]>): Promise<InputFieldTypes> {
        if (TicketSearchDefinition.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        } else if (TicketSearchDefinition.isDateTime(property)) {
            return InputFieldTypes.DATE_TIME;
        }

        return InputFieldTypes.TEXT;
    }

    private static isDropDown(property: string): boolean {
        return property === TicketProperty.QUEUE_ID
            || property === TicketProperty.STATE_ID
            || property === TicketProperty.PRIORITY_ID
            || property === TicketProperty.TYPE_ID
            || property === TicketProperty.SERVICE_ID
            || property === TicketProperty.SLA_ID;
    }

    private static isDateTime(property: string): boolean {
        return property === TicketProperty.AGE
            || property === TicketProperty.CREATE_TIME
            || property === TicketProperty.CLOSE_TIME
            || property === TicketProperty.CHANGE_TIME
            || property === TicketProperty.PENDING_TIME
            || property === TicketProperty.LAST_CHANGE_TIME
            || property === TicketProperty.ESCALATION_TIME
            || property === TicketProperty.ESCALATION_RESPONSE_TIME
            || property === TicketProperty.ESCALATION_SOLUTIONS_TIME
            || property === TicketProperty.ESCALATION_UPDATE_TIME;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(TicketProperty.TYPE_ID, 'ticket-input-type');
        components.set(TicketProperty.PRIORITY_ID, 'ticket-input-priority');
        components.set(TicketProperty.STATE_ID, 'ticket-input-state');
        components.set(TicketProperty.SLA_ID, 'ticket-input-sla');
        components.set(TicketProperty.SERVICE_ID, 'ticket-input-service');
        components.set(TicketProperty.QUEUE_ID, 'ticket-input-queue');
        components.set(TicketProperty.ARCHIVE_FLAG, 'ticket-input-archive-search');

        return components;
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const contactCategory = new SearchResultCategory('Ansprechpartner', KIXObjectType.CONTACT);
        const customerCategory = new SearchResultCategory('Kunden', KIXObjectType.CUSTOMER);
        const ciCategory = new SearchResultCategory('Config Items', KIXObjectType.CONFIG_ITEM);

        return new SearchResultCategory(
            'Tickets', KIXObjectType.TICKET, [contactCategory, customerCategory, ciCategory]
        );
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            criteria.push(new FilterCriteria(
                TicketProperty.TICKET_NUMBER, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                TicketProperty.TITLE, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                TicketProperty.BODY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                TicketProperty.FROM, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                TicketProperty.TO, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
            criteria.push(new FilterCriteria(
                TicketProperty.CC, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
            ));
        }
        return criteria;
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        const criteria = [];
        switch (property) {
            case TicketProperty.SLA_ID:
            case TicketProperty.TYPE_ID:
            case TicketProperty.SERVICE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.QUEUE_ID:
                criteria.push(new FilterCriteria(
                    property, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, value
                ));
                break;
            case TicketProperty.STATE_ID:
                criteria.push(new FilterCriteria(
                    property, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.AND, (value as any).stateId
                ));
                break;
            case SearchProperty.FULLTEXT:
                criteria.push(new FilterCriteria(
                    TicketProperty.TICKET_NUMBER, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                ));
                criteria.push(new FilterCriteria(
                    TicketProperty.TITLE, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                ));
                criteria.push(new FilterCriteria(
                    TicketProperty.BODY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                ));
                criteria.push(new FilterCriteria(
                    TicketProperty.FROM, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                ));
                criteria.push(new FilterCriteria(
                    TicketProperty.TO, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                ));
                criteria.push(new FilterCriteria(
                    TicketProperty.CC, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, value
                ));

                break;
            case TicketProperty.ARCHIVE_FLAG:
                if (value === ArchiveFlag.ALL) {
                    criteria.push(new FilterCriteria(
                        TicketProperty.ARCHIVE_FLAG, SearchOperator.IN,
                        FilterDataType.STRING, FilterType.AND, ['y', 'n']
                    ));
                } else if (value === ArchiveFlag.ARCHIVED) {
                    criteria.push(new FilterCriteria(
                        TicketProperty.ARCHIVE_FLAG, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'y')
                    );
                } else if (value === ArchiveFlag.NOT_ARCHIVED) {
                    criteria.push(new FilterCriteria(
                        TicketProperty.ARCHIVE_FLAG, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'n')
                    );
                }
                break;
            case TicketProperty.TICKET_NUMBER:
            case TicketProperty.TITLE:
            default:
                criteria.push(
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                );
        }

        return criteria;
    }
}
