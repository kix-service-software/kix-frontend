/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CMDBService } from './CMDBService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { VersionProperty } from '../../model/VersionProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ConfigItemClassAttributeUtil } from '.';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchDefinition, SearchOperatorUtil } from '../../../search/webapp/core';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Organisation } from '../../../customer/model/Organisation';
import { Contact } from '../../../customer/model/Contact';
import { ConfigItem } from '../../model/ConfigItem';
import { InputDefinition } from '../../model/InputDefinition';
import { GeneralCatalogItem } from '../../../general-catalog/model/GeneralCatalogItem';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class ConfigItemSearchFormManager extends SearchFormManager {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    protected readPermissions: Map<string, boolean> = new Map();

    public useOwnSearch: boolean = true;

    public constructor(public ignorePropertiesFixed: string[] = []) {
        super();
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        let properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [ConfigItemProperty.NAME, null],
            [VersionProperty.NUMBER, null],
            [KIXObjectProperty.CHANGE_TIME, null]
        ];

        const canContact = await this.checkReadPermissions('contacts');
        const canOrganisation = await this.checkReadPermissions('organisations');
        const canGeneralCatalog = await this.checkReadPermissions('system/generalcatalog');

        if (await this.checkReadPermissions('system/cmdb/classes')) {
            properties.push([ConfigItemProperty.CLASS_ID, null]);
        }

        if (canGeneralCatalog) {
            properties.push([ConfigItemProperty.CUR_DEPL_STATE_ID, null]);
            properties.push([ConfigItemProperty.CUR_INCI_STATE_ID, null]);
        }

        if (await this.checkReadPermissions('system/users')) {
            properties.push([KIXObjectProperty.CHANGE_BY, null]);
        }

        properties = properties.filter(
            (p) => !this.ignorePropertiesFixed.some((ip) => ip === p[0])
                && !this.ignoreProperties.some((ip) => ip === p[0])
        );

        for (const p of properties) {
            const label = await LabelService.getInstance().getPropertyText(p[0], KIXObjectType.CONFIG_ITEM);
            p[1] = label;
        }

        const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
        const classAttributes = await ConfigItemClassAttributeUtil.getMergedClassAttributeIds(
            classParameter ? classParameter.value : null
        );

        classAttributes.filter((ca) => {
            switch (ca[2]) {
                case 'GeneralCatalog':
                    return canGeneralCatalog;
                case 'Organisation':
                    return canOrganisation;
                case 'Contact':
                    return canContact;
                default:
                    return true;
            }
        });

        for (const ca of classAttributes) {
            const label = await TranslationService.translate(ca[1]);
            properties.push([ca[0], label]);
        }

        return properties;
    }

    protected async checkReadPermissions(resource: string): Promise<boolean> {
        if (!this.readPermissions.has(resource)) {
            const permission = await AuthenticationSocketClient.getInstance().checkPermissions(
                [new UIComponentPermission(resource, [CRUD.READ])]
            );
            this.readPermissions.set(resource, permission);
        }

        return this.readPermissions.get(resource);
    }

    public async getOperations(property: string): Promise<any[]> {
        let operations: Array<string | SearchOperator> = [];

        const numberOperators = [
            SearchOperator.IN
        ];

        const stringOperators = SearchDefinition.getStringOperators();

        const dateTimeOperators = SearchDefinition.getDateTimeOperators();

        if (property === SearchProperty.FULLTEXT) {
            operations = [SearchOperator.CONTAINS];
        } else if (property === ConfigItemProperty.NAME || property === VersionProperty.NUMBER) {
            operations = stringOperators;
        } else if (this.isDropDown(property)) {
            operations = numberOperators;
        } else if (this.isDateTime(property)) {
            operations = dateTimeOperators;
        } else {
            const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
            const type = await ConfigItemClassAttributeUtil.getAttributeType(
                property, classParameter ? classParameter.value : null
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
            } else {

                // use type rather than property
                operations = await super.getOperations(type);
            }
        }

        return operations;
    }

    public async getInputType(property: string, operator?: SearchOperator): Promise<InputFieldTypes | string> {
        let inputType: InputFieldTypes | string;

        if (this.isDropDown(property)) {
            inputType = InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            inputType = InputFieldTypes.DATE_TIME;
        } else {
            const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
            const type = await ConfigItemClassAttributeUtil.getAttributeType(
                property, classParameter ? classParameter.value : null
            );

            if (type === 'Date') {
                inputType = InputFieldTypes.DATE;
            } else if (type === 'DateTime') {
                inputType = InputFieldTypes.DATE_TIME;
            } else if (type === 'Text') {
                inputType = InputFieldTypes.TEXT;
            } else if (type === 'TextArea') {
                inputType = InputFieldTypes.TEXT_AREA;
            } else if (type === 'GeneralCatalog') {
                inputType = InputFieldTypes.DROPDOWN;
            } else if (type === 'CIClassReference') {
                inputType = InputFieldTypes.OBJECT_REFERENCE;
            } else if (type === 'Organisation' || type === 'Contact') {
                inputType = InputFieldTypes.OBJECT_REFERENCE;
            } else {

                // use type rather than property
                inputType = await super.getInputType(type);
            }
        }

        if (inputType === InputFieldTypes.DATE || inputType === InputFieldTypes.DATE_TIME) {
            const relativeDateTimeOperators = SearchDefinition.getRelativeDateTimeOperators();
            if (operator && relativeDateTimeOperators.includes(operator))
                inputType = InputFieldTypes.TEXT;
        }

        return inputType;
    }

    private isDropDown(property: string): boolean {
        return property === ConfigItemProperty.CUR_DEPL_STATE_ID
            || property === ConfigItemProperty.CUR_INCI_STATE_ID
            || property === ConfigItemProperty.CLASS_ID
            || property === KIXObjectProperty.CREATE_BY
            || property === KIXObjectProperty.CHANGE_BY;
    }

    private isDateTime(property: string): boolean {
        return property === KIXObjectProperty.CREATE_TIME
            || property === KIXObjectProperty.CHANGE_TIME;
    }

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        switch (property) {
            case ConfigItemProperty.CLASS_ID:
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
            case ConfigItemProperty.CUR_INCI_STATE_ID:
            case ConfigItemProperty.CHANGE_BY:
                return await CMDBService.getInstance().getTreeNodes(property, true, true);
            default:
                const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
                const input = await ConfigItemClassAttributeUtil.getAttributeInput(
                    property, classParameter ? classParameter.value : null
                );

                if (input) {
                    if (input.Type === 'GeneralCatalog') {
                        const items = await this.getGeneralCatalogItems(input, objectIds);
                        return items.map((item) => new TreeNode(
                            item.ItemID, item.Name,
                            new ObjectIcon(null, KIXObjectType.GENERAL_CATALOG_ITEM, item.ObjectId)
                        ));
                    } else if (input.Type === 'Organisation' && objectIds) {
                        const organisations = await KIXObjectService.loadObjects<Organisation>(
                            KIXObjectType.ORGANISATION, objectIds
                        );
                        return await KIXObjectService.prepareTree(organisations);
                    } else if (input.Type === 'Contact' && objectIds) {
                        const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, objectIds);
                        return await KIXObjectService.prepareTree(contacts);
                    } else if (input.Type === 'CIClassReference' && objectIds) {
                        const items = await KIXObjectService.loadObjects<ConfigItem>(
                            KIXObjectType.CONFIG_ITEM, objectIds
                        );
                        return await KIXObjectService.prepareTree(items);
                    } else {

                        // use type rather than property
                        return await super.getTreeNodes(input.Type);
                    }
                }
        }

        return [];
    }

    public getOperatorDisplayText(operator: string): Promise<string> {
        return SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public async isMultiselect(property: string, operator: SearchOperator | string): Promise<boolean> {
        return true;
    }

    public async searchObjectTree(
        property: string, searchValue: string, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        let tree = [];

        const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(
            property, classParameter ? classParameter.value : null
        );

        if (input.Type === 'CIClassReference') {
            const configItems = await this.loadConfigItems(input, searchValue, loadingOptions);
            tree = configItems.map(
                (ci) => new TreeNode(ci.ConfigItemID, ci.Name, new ObjectIcon(null, ci.KIXObjectType, ci.ConfigItemID))
            );
        } else if (input.Type === 'Organisation') {
            const organisations = await KIXObjectService.search(
                KIXObjectType.ORGANISATION, searchValue, loadingOptions
            );
            return await KIXObjectService.prepareTree(organisations);
        } else if (input.Type === 'Contact') {
            const contacts = await KIXObjectService.search(KIXObjectType.CONTACT, searchValue, loadingOptions);
            return await KIXObjectService.prepareTree(contacts);
        }

        return tree;
    }

    private async getGeneralCatalogItems(
        input: InputDefinition, objectIds?: Array<string | number>
    ): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                'Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, input['Class']
            )
        ]);

        const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, objectIds, loadingOptions, null, false
        );
        return items;
    }

    private async loadConfigItems(
        input: InputDefinition, searchValue: string, loadingOptions: KIXObjectLoadingOptions
    ): Promise<ConfigItem[]> {
        const classReference = input['ReferencedCIClassName'];
        const ciClassNames = Array.isArray(classReference) ? classReference : [classReference];

        const configItems = await CMDBService.getInstance().searchConfigItemsByClass(
            ciClassNames, searchValue, loadingOptions
        );
        return configItems;
    }

}
