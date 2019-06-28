import { SearchDefinition, SearchResultCategory, KIXObjectService } from "../kix";
import {
    KIXObjectType, ConfigItemProperty, FilterCriteria, ConfigItemClass, FilterDataType,
    FilterType, GeneralCatalogItem, VersionProperty, KIXObjectLoadingOptions, InputFieldTypes,
    TreeNode, ObjectIcon, DataType, AttributeDefinition, Organisation, Contact, InputDefinition, ConfigItem
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { SearchProperty } from "../SearchProperty";
import { ConfigItemClassAttributeUtil } from "./ConfigItemClassAttributeUtil";
import { CMDBService } from "./CMDBService";
import { IColumnConfiguration, DefaultColumnConfiguration } from "../table";
import { ContactService } from "../contact";
import { LabelService } from "../LabelService";
import { OrganisationService } from "../organisation";

export class ConfigItemSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CONFIG_ITEM);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(
            criteria, null, null,
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
            const classAttributes = await ConfigItemClassAttributeUtil.getMergedClassAttributeIds(
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
                const type = await ConfigItemClassAttributeUtil.getAttributeType(
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
                    || type === 'Organisation'
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
            const type = await ConfigItemClassAttributeUtil.getAttributeType(
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
            } else if (type === 'Organisation' || type === 'Contact') {
                return InputFieldTypes.OBJECT_REFERENCE;
            }
        }

        return InputFieldTypes.TEXT;
    }

    public async getTreeNodes(property: string, parameter: Array<[string, any]>): Promise<TreeNode[]> {
        const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(
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
        const faqCategory = new SearchResultCategory('FAQs', KIXObjectType.FAQ_ARTICLE);
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
                        const path = await ConfigItemClassAttributeUtil.getAttributePath(
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
                criteria.push(
                    new FilterCriteria(
                        property, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, value
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
            case VersionProperty.CUR_DEPL_STATE_ID:
            case VersionProperty.CUR_INCI_STATE_ID:
                if (value instanceof GeneralCatalogItem) {
                    const item = value as GeneralCatalogItem;
                    criteria.push(new FilterCriteria(
                        property, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, item.ItemID
                    ));
                    break;
                }
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
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(
            property, classParameter ? classParameter[1] : null
        );

        if (input.Type === 'CIClassReference') {
            const configItems = await this.loadConfigItems(input, searchValue, limit);
            return configItems.map(
                (ci) => new TreeNode(ci.ConfigItemID, ci.Name, new ObjectIcon(ci.KIXObjectType, ci.ConfigItemID))
            );
        } else if (input.Type === 'Organisation') {
            const loadingOptions = new KIXObjectLoadingOptions(
                OrganisationService.getInstance().prepareFullTextFilter(searchValue), null, limit
            );
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, null, loadingOptions, null, false
            );
            const nodes = [];
            for (const c of organisations) {
                const displayValue = await LabelService.getInstance().getText(c);
                nodes.push(new TreeNode(c.ID, displayValue, new ObjectIcon(c.KIXObjectType, c.ID)));
            }
            return nodes;
        } else if (input.Type === 'Contact') {
            const loadingOptions = new KIXObjectLoadingOptions(
                ContactService.getInstance().prepareFullTextFilter(searchValue), null, limit
            );
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
        return [];
    }

    public async getTableColumnConfiguration(searchParameter: Array<[string, any]>): Promise<IColumnConfiguration[]> {
        const classParameter = searchParameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        let attributes: AttributeDefinition[];
        if (classParameter) {
            const classIds = Array.isArray(classParameter[1]) ? classParameter[1] : [classParameter[1]];
            attributes = await ConfigItemClassAttributeUtil.getAttributeDefinitions(classIds);
        }

        const columns: IColumnConfiguration[] = [];
        for (const p of searchParameter) {
            switch (p[0]) {
                case ConfigItemProperty.CLASS_ID:
                case ConfigItemProperty.NUMBER:
                case ConfigItemProperty.NAME:
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                    columns.push(new DefaultColumnConfiguration(
                        p[0], false, true, false, true, 55, true, true, false, DataType.STRING, false
                    ));
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

    private getColumn(attribute: AttributeDefinition): IColumnConfiguration {
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

        const column = new DefaultColumnConfiguration(
            attribute.Key, true, false, true, false, 150, true, true, false, type
        );

        return column;
    }

    public async getDisplaySearchValue(property: string, parameter: Array<[string, any]>, value: any): Promise<string> {
        let displayValue = await super.getDisplaySearchValue(property, parameter, value);
        const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(
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
            } else if (input.Type === 'Organisation') {
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, [value], null, null, false
                );

                if (organisations && organisations.length) {
                    displayValue = await LabelService.getInstance().getText(organisations[0]);
                }
            } else if (input.Type === 'Contact') {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [value], null, null, false
                );

                if (contacts && contacts.length) {
                    displayValue = await LabelService.getInstance().getText(contacts[0]);
                }
            }
        }

        return displayValue;
    }

    private async getGeneralCatalogItems(input: InputDefinition): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                'Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, input['Class']
            )
        ]);

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
