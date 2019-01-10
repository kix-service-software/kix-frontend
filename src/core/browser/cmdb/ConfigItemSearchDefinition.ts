import { SearchDefinition, SearchResultCategory, KIXObjectService } from "../kix";
import {
    KIXObjectType, ConfigItemProperty, FilterCriteria, ConfigItemClass, FilterDataType,
    FilterType, GeneralCatalogItem, VersionProperty, KIXObjectLoadingOptions, InputFieldTypes,
    TreeNode, ObjectIcon, DataType, AttributeDefinition, Customer, Contact, InputDefinition, ConfigItem
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";
import { ConfigItemClassAttributeUtil } from "./ConfigItemClassAttributeUtil";
import { CMDBService } from "./CMDBService";
import { TableColumn } from "../standard-table";

export class ConfigItemSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CONFIG_ITEM);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(
            null, criteria, null, null, null,
            [VersionProperty.DATA, VersionProperty.PREPARED_DATA, 'Links', ConfigItemProperty.CURRENT_VERSION],
            [VersionProperty.DATA, VersionProperty.PREPARED_DATA, 'Links']
        );
    }

    public async getProperties(parameter?: Array<[string, any]>): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [VersionProperty.NAME, null],
            [VersionProperty.NUMBER, null],
            [ConfigItemProperty.CLASS_ID, null],
            [ConfigItemProperty.CUR_DEPL_STATE_ID, null],
            [ConfigItemProperty.CUR_INCI_STATE_ID, null]
        ];

        if (parameter) {
            const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
            const classAttributes = await ConfigItemClassAttributeUtil.getInstance().getMergedClassAttributeIds(
                classParameter ? classParameter[1] : null
            );
            classAttributes.forEach((ca) => properties.push(ca));
        }

        return properties;
    }

    public async getOperations(property: string, parameter?: Array<[string, any]>): Promise<SearchOperator[]> {
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
            case VersionProperty.NAME:
            case VersionProperty.NUMBER:
                operations = stringOperators;
                break;
            case ConfigItemProperty.CLASS_ID:
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                operations = numberOperators;
                break;
            default:
                const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
                const type = await ConfigItemClassAttributeUtil.getInstance().getAttributeType(
                    property, classParameter ? classParameter[1] : null
                );
                if (type === 'Date') {
                    operations = dateTimeOperators;
                } else if (type === 'DateTime') {
                    operations = dateTimeOperators;
                } else if (type === 'Text' || type === 'TextArea') {
                    operations = stringOperators;
                } else if (type === 'GeneralCatalog'
                    || type === 'CIClassReference'
                    || type === 'Customer'
                    || type === 'Contact'
                ) {
                    operations = numberOperators;
                }
        }

        return operations;
    }

    public async getInputFieldType(
        property: string, parameter?: Array<[string, any]>
    ): Promise<InputFieldTypes> {

        if (ConfigItemSearchDefinition.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        } else {
            const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
            const type = await ConfigItemClassAttributeUtil.getInstance().getAttributeType(
                property, classParameter ? classParameter[1] : null
            );

            if (type === 'Date') {
                return InputFieldTypes.DATE;
            } else if (type === 'DateTime') {
                return InputFieldTypes.DATE_TIME;
            } else if (type === 'Text') {
                return InputFieldTypes.TEXT;
            } else if (type === 'TextArea') {
                return InputFieldTypes.TEXT_AREA;
            } else if (type === 'GeneralCatalog') {
                return InputFieldTypes.DROPDOWN;
            } else if (type === 'CIClassReference') {
                return InputFieldTypes.CI_REFERENCE;
            } else if (type === 'Customer' || type === 'Contact') {
                return InputFieldTypes.OBJECT_REFERENCE;
            }
        }

        return InputFieldTypes.TEXT;
    }

    public async getTreeNodes(property: string, parameter: Array<[string, any]>): Promise<TreeNode[]> {
        const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getInstance().getAttributeInput(
            property, classParameter ? classParameter[1] : null
        );

        if (input) {
            if (input.Type === 'GeneralCatalog') {
                const items = await this.getGeneralCatalogItems(input);
                return items.map((item) => new TreeNode(
                    item.ItemID, item.Name, new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, item.ObjectId)
                ));
            }
        }

        return [];
    }

    private static isDropDown(property: string): boolean {
        return property === ConfigItemProperty.CUR_DEPL_STATE_ID
            || property === ConfigItemProperty.CUR_INCI_STATE_ID
            || property === ConfigItemProperty.CLASS_ID;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        return new Map();
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const ticketCategory = new SearchResultCategory('Tickets', KIXObjectType.TICKET);
        const faqCategory = new SearchResultCategory('FAQ', KIXObjectType.FAQ_ARTICLE);
        return new SearchResultCategory('Config Items', KIXObjectType.CONFIG_ITEM, [ticketCategory, faqCategory]);
    }

    public async prepareFormFilterCriteria(criteria: FilterCriteria[]): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria);

        const classIdCriteria = criteria.find((c) => c.property === ConfigItemProperty.CLASS_ID);
        let classIds;
        if (classIdCriteria) {
            classIds = Array.isArray(classIdCriteria.value) ? classIdCriteria.value : [classIdCriteria.value];
        }

        const newCriteria: FilterCriteria[] = [];

        for (const searchCriteria of criteria) {
            switch (searchCriteria.property) {
                case SearchProperty.FULLTEXT:
                    newCriteria.push(new FilterCriteria(
                        ConfigItemProperty.NUMBER, SearchOperator.CONTAINS,
                        FilterDataType.STRING, FilterType.OR, searchCriteria.value
                    ));
                    newCriteria.push(new FilterCriteria(
                        'CurrentVersion.' + VersionProperty.NAME, SearchOperator.CONTAINS,
                        FilterDataType.STRING, FilterType.OR, searchCriteria.value
                    ));
                    break;
                case VersionProperty.NAME:
                    newCriteria.push(new FilterCriteria(
                        'CurrentVersion.' + VersionProperty.NAME, searchCriteria.operator,
                        searchCriteria.type, searchCriteria.filterType, searchCriteria.value
                    ));
                    break;
                case VersionProperty.NUMBER:
                case ConfigItemProperty.CLASS_ID:
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                    newCriteria.push(searchCriteria);
                    break;
                default:
                    if (classIds) {
                        const path = await ConfigItemClassAttributeUtil.getInstance().getAttributePath(
                            searchCriteria.property, classIds
                        );
                        if (path) {
                            newCriteria.push(new FilterCriteria(
                                `CurrentVersion.Data.${path}`, searchCriteria.operator,
                                searchCriteria.type, searchCriteria.filterType, searchCriteria.value
                            ));
                        }
                    }
            }
        }
        return newCriteria;
    }

    public prepareSearchFormValue(property: string, value: any): FilterCriteria[] {
        const criteria = [];
        switch (property) {
            case ConfigItemProperty.CLASS_ID:
                const ciClass = value as ConfigItemClass;
                criteria.push(
                    new FilterCriteria(
                        property, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, ciClass.ID
                    )
                );
                break;
            case ConfigItemProperty.NAME:
                criteria.push(new FilterCriteria(
                    "CurrentVersion." + property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value
                ));
                break;
            case ConfigItemProperty.NUMBER:
                criteria.push(
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                );
                break;
            case VersionProperty.CUR_DEPL_STATE_ID:
            case VersionProperty.CUR_INCI_STATE_ID:
                const item = value as GeneralCatalogItem;
                criteria.push(new FilterCriteria(
                    property, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, item.ItemID
                ));
                break;
            case SearchProperty.FULLTEXT:
                criteria.push(new FilterCriteria(
                    ConfigItemProperty.NUMBER, SearchOperator.CONTAINS,
                    FilterDataType.STRING, FilterType.OR, value
                ));
                criteria.push(new FilterCriteria(
                    'CurrentVersion.' + VersionProperty.NAME, SearchOperator.CONTAINS,
                    FilterDataType.STRING, FilterType.OR, value
                ));
                break;
            default:
                criteria.push(new FilterCriteria(
                    property, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, value
                ));
        }
        return criteria;
    }

    public async searchValues(
        property: string, parameter: Array<[string, any]>, searchValue: string, limit: number
    ): Promise<TreeNode[]> {
        const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getInstance().getAttributeInput(
            property, classParameter ? classParameter[1] : null
        );

        if (input.Type === 'CIClassReference') {
            const configItems = await this.loadConfigItems(input, searchValue, limit);
            return configItems.map(
                (ci) => new TreeNode(ci.ConfigItemID, ci.Name, new ObjectIcon(ci.KIXObjectType, ci.ConfigItemID))
            );
        } else if (input.Type === 'Customer') {
            const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
            const customers = await KIXObjectService.loadObjects<Customer>(
                KIXObjectType.CUSTOMER, null, loadingOptions, null, false
            );
            return customers.map(
                (c) => new TreeNode(c.CustomerID, c.DisplayValue, new ObjectIcon(c.KIXObjectType, c.CustomerID))
            );
        } else if (input.Type === 'Contact') {
            const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, null, false
            );
            return contacts.map(
                (c) => new TreeNode(c.ContactID, c.DisplayValue, new ObjectIcon(c.KIXObjectType, c.ContactID))
            );
        }
        return [];
    }

    public async getTableColumnConfiguration(searchParameter: Array<[string, any]>): Promise<TableColumn[]> {
        const classParameter = searchParameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        let attributes: AttributeDefinition[];
        if (classParameter) {
            const classIds = Array.isArray(classParameter[1]) ? classParameter[1] : [classParameter[1]];
            attributes = await ConfigItemClassAttributeUtil.getInstance().getAttributeDefinitions(classIds);
        }

        const columns = [];
        for (const p of searchParameter) {
            switch (p[0]) {
                case ConfigItemProperty.CLASS_ID:
                case ConfigItemProperty.NUMBER:
                case ConfigItemProperty.NAME:
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                    columns.push(new TableColumn(
                        p[0], DataType.STRING, p[1], null, true, true, 100, true, false, true, true, null)
                    );
                    break;
                default:
                    if (attributes) {
                        const attribute = attributes.find((a) => a.Key === p[0]);
                        if (attribute) {
                            const column = this.getColumn(attribute);
                            if (column) {
                                columns.push(column);
                            }
                        }
                    }
                    break;
            }
        }
        return columns;
    }

    private getColumn(attribute: AttributeDefinition): TableColumn {
        let type = DataType.STRING;
        switch (attribute.Input.Type) {
            case 'Date':
                type = DataType.DATE;
                break;
            case 'DateTime':
                type = DataType.DATE_TIME;
                break;
            default:
                type = DataType.STRING;
        }

        const column = new TableColumn(
            attribute.Key, type, attribute.Name, null, true, true, 100, true, false, true, true, null
        );

        return column;
    }

    public async getDisplaySearchValue(property: string, parameter: Array<[string, any]>, value: any): Promise<string> {
        let displayValue = await super.getDisplaySearchValue(property, parameter, value);
        const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getInstance().getAttributeInput(
            property, classParameter ? classParameter[1] : null
        );

        if (input) {
            if (input.Type === 'GeneralCatalog') {
                const items = await this.getGeneralCatalogItems(input);
                const item = items.find((i) => i.ItemID === value);
                if (item) {
                    displayValue = item.Name;
                }
            } else if (input.Type === 'CIClassReference') {
                const configItems = await KIXObjectService.loadObjects<ConfigItem>(KIXObjectType.CONFIG_ITEM, [value]);
                if (configItems && configItems.length) {
                    displayValue = configItems[0].Name;
                }
            } else if (input.Type === 'Customer') {
                const customers = await KIXObjectService.loadObjects<Customer>(
                    KIXObjectType.CUSTOMER, [value], null, null, false
                );

                if (customers && customers.length) {
                    displayValue = customers[0].DisplayValue;
                }
            } else if (input.Type === 'Contact') {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [value], null, null, false
                );

                if (contacts && contacts.length) {
                    displayValue = contacts[0].DisplayValue;
                }
            }
        }

        return displayValue;
    }

    private async getGeneralCatalogItems(input: InputDefinition): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, [new FilterCriteria(
            'Class', SearchOperator.EQUALS, FilterDataType.STRING,
            FilterType.AND, input['Class']
        )]);

        const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null, false
        );
        return items;
    }

    private async loadConfigItems(input: InputDefinition, searchValue: string, limit: number): Promise<ConfigItem[]> {
        const classReference = input['ReferencedCIClassName'];
        const ciClassNames = Array.isArray(classReference) ? classReference : [classReference];

        const configItems = await CMDBService.getInstance().searchConfigItemsByClass(
            ciClassNames, searchValue, limit
        );
        return configItems;
    }

}
