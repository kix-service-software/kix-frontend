import { SearchDefinition, SearchResultCategory, KIXObjectService } from "../kix";
import {
    KIXObjectType, TicketProperty, InputFieldTypes, FilterCriteria,
    KIXObjectLoadingOptions, FilterDataType, FilterType, ArchiveFlag, TreeNode, Organisation,
    ObjectIcon, Contact, KIXObjectProperty
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";
import { OrganisationService } from "../organisation";
import { LabelService } from "../LabelService";
import { ContactService } from "../contact";

export class TicketSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.TICKET);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, null, ['Links'], ['Links']);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [TicketProperty.TICKET_NUMBER, null],
            [TicketProperty.TITLE, null],
            [TicketProperty.CREATED, null],
            [TicketProperty.CLOSE_TIME, null],
            [TicketProperty.CHANGED, null],
            [TicketProperty.PENDING_TIME, null],
            [TicketProperty.LAST_CHANGE_TIME, null]
        ];

        if (await this.checkReadPermissions('organisations')) {
            properties.push([TicketProperty.ORGANISATION_ID, null]);
        }

        if (await this.checkReadPermissions('contacts')) {
            properties.push([TicketProperty.CONTACT_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/types')) {
            properties.push([TicketProperty.TYPE_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/states')) {
            properties.push([TicketProperty.STATE_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/queues')) {
            properties.push([TicketProperty.QUEUE_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/priorities')) {
            properties.push([TicketProperty.PRIORITY_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/locks')) {
            properties.push([TicketProperty.LOCK_ID, null]);
        }

        if (await this.checkReadPermissions('system/users')) {
            properties.push([TicketProperty.OWNER_ID, null]);
            properties.push([TicketProperty.RESPONSIBLE_ID, null]);
            properties.push([KIXObjectProperty.CREATE_BY, null]);
            properties.push([KIXObjectProperty.CHANGE_BY, null]);
        }

        return properties;
    }

    public async getOperations(property: string): Promise<SearchOperator[]> {
        let operations: SearchOperator[] = [];

        switch (property) {
            case TicketProperty.TICKET_NUMBER:
            case TicketProperty.TITLE:
                operations = this.getStringOperators();
                break;
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.SERVICE_ID:
            case TicketProperty.SLA_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.CONTACT_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                operations = [SearchOperator.IN];
                break;
            case TicketProperty.LOCK_ID:
                operations = [SearchOperator.EQUALS];
                break;
            case TicketProperty.AGE:
            case TicketProperty.CREATED:
            case TicketProperty.CLOSE_TIME:
            case TicketProperty.CHANGED:
            case TicketProperty.PENDING_TIME:
            case TicketProperty.LAST_CHANGE_TIME:
            case TicketProperty.ESCALATION_TIME:
            case TicketProperty.ESCALATION_RESPONSE_TIME:
            case TicketProperty.ESCALATION_UPDATE_TIME:
            case TicketProperty.ESCALATION_SOLUTION_TIME:
                operations = this.getDateTimeOperators();
                break;
            default:
                operations = [];
        }

        return operations;
    }

    public async getInputFieldType(property: string, parameter?: Array<[string, any]>): Promise<InputFieldTypes> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            return InputFieldTypes.DATE_TIME;
        } else if (property === TicketProperty.ORGANISATION_ID || property === TicketProperty.CONTACT_ID) {
            return InputFieldTypes.OBJECT_REFERENCE;
        }

        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === TicketProperty.QUEUE_ID
            || property === TicketProperty.STATE_ID
            || property === TicketProperty.PRIORITY_ID
            || property === TicketProperty.TYPE_ID
            || property === TicketProperty.SERVICE_ID
            || property === TicketProperty.SLA_ID
            || property === TicketProperty.OWNER_ID
            || property === TicketProperty.RESPONSIBLE_ID
            || property === TicketProperty.LOCK_ID
            || property === KIXObjectProperty.CREATE_BY
            || property === KIXObjectProperty.CHANGE_BY;
    }

    private isDateTime(property: string): boolean {
        return property === TicketProperty.AGE
            || property === TicketProperty.CREATED
            || property === TicketProperty.CLOSE_TIME
            || property === TicketProperty.CHANGED
            || property === TicketProperty.PENDING_TIME
            || property === TicketProperty.LAST_CHANGE_TIME
            || property === TicketProperty.ESCALATION_TIME
            || property === TicketProperty.ESCALATION_RESPONSE_TIME
            || property === TicketProperty.ESCALATION_SOLUTION_TIME
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
        const categories: SearchResultCategory[] = [];

        if (await this.checkReadPermissions('contacts')) {
            categories.push(
                new SearchResultCategory('Translatable#Contacts', KIXObjectType.CONTACT)
            );
        }
        if (await this.checkReadPermissions('organisations')) {
            categories.push(
                new SearchResultCategory('Translatable#Organisations', KIXObjectType.ORGANISATION)
            );
        }
        if (await this.checkReadPermissions('cmdb/configitems')) {
            categories.push(
                new SearchResultCategory('Translatable#Config Items', KIXObjectType.CONFIG_ITEM)
            );
        }

        return new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET, categories);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            criteria = [...criteria, ...this.getFulltextCriteria(value as string)];
        }
        return criteria;
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        let criteria = [];
        switch (property) {
            case TicketProperty.SLA_ID:
            case TicketProperty.TYPE_ID:
            case TicketProperty.SERVICE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.STATE_ID:
                if (value) {
                    criteria.push(new FilterCriteria(
                        property, SearchOperator.EQUALS,
                        FilterDataType.NUMERIC, FilterType.AND, value
                    ));
                }
                break;
            case SearchProperty.FULLTEXT:
                criteria = [...criteria, ...this.getFulltextCriteria(value)];
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
            default:
                criteria.push(
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                );
        }

        return criteria;
    }

    public async searchValues(
        property: string, parameter: Array<[string, any]>, searchValue: string, limit: number
    ): Promise<TreeNode[]> {
        if (property === TicketProperty.ORGANISATION_ID) {
            const filter = await OrganisationService.getInstance().prepareFullTextFilter(searchValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, null, loadingOptions, null, false
            );
            const nodes = [];
            for (const c of organisations) {
                const displayValue = await LabelService.getInstance().getText(c);
                nodes.push(new TreeNode(c.ID, displayValue, new ObjectIcon(c.KIXObjectType, c.ID)));
            }
            return nodes;
        } else if (property === TicketProperty.CONTACT_ID) {
            const filter = await ContactService.getInstance().prepareFullTextFilter(searchValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, null, false
            );
            const nodes = [];
            for (const c of contacts) {
                const displayValue = await LabelService.getInstance().getText(c);
                nodes.push(new TreeNode(c.ID, displayValue, new ObjectIcon(c.KIXObjectType, c.ID)));
            }
            return nodes;
        }
    }

    private getFulltextCriteria(value: string): FilterCriteria[] {
        const criteria: FilterCriteria[] = [];
        if (value) {
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
}
