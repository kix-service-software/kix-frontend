/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from "../form";
import {
    KIXObjectType, VersionProperty, KIXObjectProperty, ConfigItemProperty, CRUD, InputFieldTypes,
    TreeNode, ObjectIcon, KIXObjectLoadingOptions, InputDefinition, FilterCriteria, FilterDataType,
    FilterType, GeneralCatalogItem, ConfigItem
} from "../../model";
import { LabelService } from "../LabelService";
import { SearchProperty } from "../SearchProperty";
import { ConfigItemClassAttributeUtil } from "./ConfigItemClassAttributeUtil";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { SearchOperator } from "../SearchOperator";
import { SearchDefinition, KIXObjectService } from "../kix";
import { SearchOperatorUtil } from "../SearchOperatorUtil";
import { CMDBService } from "./CMDBService";

export class ConfigItemSearchFormManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    protected readPermissions: Map<string, boolean> = new Map();

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [VersionProperty.NAME, null],
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
        }).forEach((ca) => properties.push([ca[0], ca[1]]));

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
        let operations: SearchOperator[] = [];

        const numberOperators = [
            SearchOperator.IN
        ];

        const stringOperators = SearchDefinition.getStringOperators();

        const dateTimeOperators = SearchDefinition.getDateTimeOperators();

        if (property === SearchProperty.FULLTEXT) {
            operations = [SearchOperator.CONTAINS];
        } else if (property === VersionProperty.NAME || property === VersionProperty.NUMBER) {
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
            }
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            return InputFieldTypes.DATE_TIME;
        } else {
            const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
            const type = await ConfigItemClassAttributeUtil.getAttributeType(
                property, classParameter ? classParameter.value : null
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
                return InputFieldTypes.OBJECT_REFERENCE;
            } else if (type === 'Organisation' || type === 'Contact') {
                return InputFieldTypes.OBJECT_REFERENCE;
            }
        }

        return InputFieldTypes.TEXT;
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

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        switch (property) {
            case ConfigItemProperty.CLASS_ID:
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
            case ConfigItemProperty.CUR_INCI_STATE_ID:
            case ConfigItemProperty.CHANGE_BY:
                return await CMDBService.getInstance().getTreeNodes(property);
            default:
                const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
                const input = await ConfigItemClassAttributeUtil.getAttributeInput(
                    property, classParameter ? classParameter.value : null
                );

                if (input) {
                    if (input.Type === 'GeneralCatalog') {
                        const items = await this.getGeneralCatalogItems(input);
                        return items.map((item) => new TreeNode(
                            item.ItemID, item.Name, new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, item.ObjectId)
                        ));
                    }
                }
        }

        return [];
    }

    public async getOperatorDisplayText(operator: string): Promise<string> {
        return await SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public isMultiselect(property: string): boolean {
        return true;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        let tree = [];

        const classParameter = this.values.find((p) => p.property === ConfigItemProperty.CLASS_ID);
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(
            property, classParameter ? classParameter.value : null
        );

        if (input.Type === 'CIClassReference') {
            const configItems = await this.loadConfigItems(input, searchValue, limit);
            tree = configItems.map(
                (ci) => new TreeNode(ci.ConfigItemID, ci.Name, new ObjectIcon(ci.KIXObjectType, ci.ConfigItemID))
            );
        } else if (input.Type === 'Organisation') {
            const organisations = await KIXObjectService.search(KIXObjectType.ORGANISATION, searchValue, limit);
            const nodes = [];
            for (const o of organisations) {
                const displayValue = await LabelService.getInstance().getText(o);
                nodes.push(new TreeNode(o.ObjectId, displayValue, new ObjectIcon(o.KIXObjectType, o.ObjectId)));
            }
            return nodes;
        } else if (input.Type === 'Contact') {
            const contacts = await KIXObjectService.search(KIXObjectType.CONTACT, searchValue, limit);
            const nodes = [];
            for (const c of contacts) {
                const displayValue = await LabelService.getInstance().getText(c);
                nodes.push(new TreeNode(c.ObjectId, displayValue, new ObjectIcon(c.KIXObjectType, c.ObjectId)));
            }
            return nodes;
        }

        return tree;
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
