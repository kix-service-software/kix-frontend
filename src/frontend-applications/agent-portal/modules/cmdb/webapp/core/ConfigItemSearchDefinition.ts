/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchDefinition, SearchResultCategory } from '../../../search/webapp/core';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ConfigItemSearchFormManager } from './ConfigItemSearchFormManager';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { VersionProperty } from '../../model/VersionProperty';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { ConfigItemClassAttributeUtil } from '.';
import { IColumnConfiguration } from '../../../../model/configuration/IColumnConfiguration';
import { AttributeDefinition } from '../../model/AttributeDefinition';
import { DefaultColumnConfiguration } from '../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../model/DataType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItem } from '../../model/ConfigItem';
import { Organisation } from '../../../customer/model/Organisation';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { Contact } from '../../../customer/model/Contact';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { InputDefinition } from '../../model/InputDefinition';
import { GeneralCatalogItem } from '../../../general-catalog/model/GeneralCatalogItem';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';

export class ConfigItemSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CONFIG_ITEM);
        this.formManager = new ConfigItemSearchFormManager();
    }

    public createFormManager(ignoreProperties: string[] = []): SearchFormManager {
        return new ConfigItemSearchFormManager(ignoreProperties);
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(
            criteria, null, this.limit,
            [VersionProperty.DATA, VersionProperty.PREPARED_DATA, 'Links', ConfigItemProperty.CURRENT_VERSION],
            [VersionProperty.DATA, VersionProperty.PREPARED_DATA, 'Links']
        );
    }

    public getLoadingOptionsForResultList(): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(
            null, null, null,
            [VersionProperty.DATA, VersionProperty.PREPARED_DATA, 'Links', ConfigItemProperty.CURRENT_VERSION],
            [VersionProperty.DATA, VersionProperty.PREPARED_DATA, 'Links']
        );
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory[]> {
        const categories: SearchResultCategory[] = [];

        if (await this.checkReadPermissions('tickets')) {
            categories.push(
                new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET)
            );
        }
        if (await this.checkReadPermissions('faq/articles')) {
            categories.push(
                new SearchResultCategory('FAQs', KIXObjectType.FAQ_ARTICLE)
            );
        }
        return [new SearchResultCategory('Config Items', KIXObjectType.CONFIG_ITEM, categories)];
    }

    public async prepareFormFilterCriteria(
        criteria: FilterCriteria[], forSearch: boolean = true
    ): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria, forSearch);

        const classIdCriteria = criteria.find((c) => c.property === ConfigItemProperty.CLASS_ID);
        let classIds;
        if (classIdCriteria) {
            classIds = Array.isArray(classIdCriteria.value) ? classIdCriteria.value : [classIdCriteria.value];
        }

        const newCriteria: FilterCriteria[] = [];

        for (const searchCriteria of criteria) {
            switch (searchCriteria.property) {
                case SearchProperty.FULLTEXT:
                    newCriteria.push(searchCriteria);
                    break;
                case ConfigItemProperty.NAME:
                    newCriteria.push(new FilterCriteria(
                        ConfigItemProperty.NAME, searchCriteria.operator,
                        searchCriteria.type, searchCriteria.filterType, searchCriteria.value
                    ));
                    break;
                case ConfigItemProperty.CLASS_ID:
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                case VersionProperty.NUMBER:
                case KIXObjectProperty.CHANGE_BY:
                case KIXObjectProperty.CREATE_BY:
                    newCriteria.push(searchCriteria);
                    break;
                case KIXObjectProperty.CREATE_TIME:
                case KIXObjectProperty.CHANGE_TIME:
                    searchCriteria.type = FilterDataType.DATETIME;
                    newCriteria.push(searchCriteria);
                    break;
                default:
                    if (classIds && forSearch) {
                        const path = await ConfigItemClassAttributeUtil.getAttributePath(
                            searchCriteria.property, classIds
                        );
                        if (path) {

                            const attributeCriteria = new FilterCriteria(
                                `CurrentVersion.Data.${path}`, searchCriteria.operator,
                                searchCriteria.type, searchCriteria.filterType, searchCriteria.value
                            );

                            const type = await ConfigItemClassAttributeUtil.getAttributeType(
                                searchCriteria.property, classIds
                            );

                            if (type === 'Date') {
                                attributeCriteria.type = FilterDataType.DATE;
                            } else if (type === 'DateTime') {
                                attributeCriteria.type = FilterDataType.DATETIME;
                            }
                            newCriteria.push(attributeCriteria);
                        }
                    } else {
                        newCriteria.push(searchCriteria);
                    }
            }
        }
        return newCriteria;
    }

    public async prepareSearchFormValue(property: string, value: any): Promise<FilterCriteria[]> {
        let criteria = [];
        switch (property) {
            case ConfigItemProperty.NAME:
                criteria.push(new FilterCriteria(
                    'CurrentVersion.' + property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value
                ));
                break;
            case ConfigItemProperty.NUMBER:
                criteria.push(
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                );
                break;
            default:
                const preparedCriteria = await super.prepareSearchFormValue(property, value);
                criteria = [...criteria, ...preparedCriteria];
        }
        return criteria;
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
                    columns.push(new DefaultColumnConfiguration(null, null, null,
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
        let type;
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

        const column = new DefaultColumnConfiguration(null, null, null,
            attribute.Key, true, false, true, false, 150, true, true, false, type, undefined, undefined, attribute.Name
        );

        return column;
    }

    public async getDisplaySearchValue(
        property: string, parameter: Array<[string, any]>, value: any, type: FilterDataType
    ): Promise<string> {
        let displayValue = await super.getDisplaySearchValue(property, parameter, value, type);
        const classParameter = parameter.find((p) => p[0] === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(
            property, classParameter ? classParameter[1] : null
        );

        if (input && value) {
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
                    displayValue = await LabelService.getInstance().getObjectText(organisations[0]);
                }
            } else if (input.Type === 'Contact') {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [value], null, null, false
                );

                if (contacts && contacts.length) {
                    displayValue = await LabelService.getInstance().getObjectText(contacts[0]);
                }
            } else if (input.Type === 'Date') {
                displayValue = await DateTimeUtil.getLocalDateString(displayValue);
            } else if (input.Type === 'DateTime') {
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
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

    public getDefaultSearchCriteria(): string[] {
        return [
            SearchProperty.FULLTEXT,
            ConfigItemProperty.CLASS_ID,
            ConfigItemProperty.NAME,
            ConfigItemProperty.NUMBER,
            ConfigItemProperty.CUR_INCI_STATE_ID,
            ConfigItemProperty.CUR_DEPL_STATE_ID
        ];
    }

}
