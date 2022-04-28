/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { PropertyOperator } from '../../../../modules/base-components/webapp/core/PropertyOperator';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { SortUtil } from '../../../../model/SortUtil';
import { BulkManager } from '../../../bulk/webapp/core';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { CMDBService, ConfigItemClassAttributeUtil } from '.';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { ConfigItem } from '../../model/ConfigItem';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { Contact } from '../../../customer/model/Contact';
import { Organisation } from '../../../customer/model/Organisation';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { VersionProperty } from '../../model/VersionProperty';

export class ConfigItemBulkManager extends BulkManager {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public useOwnSearch: boolean = true;

    public async getOperations(property: string): Promise<PropertyOperator[]> {
        return [PropertyOperator.CHANGE];
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        let properties: Array<[string, string]> = [
            [
                VersionProperty.DEPL_STATE_ID,
                await LabelService.getInstance().getPropertyText(
                    VersionProperty.DEPL_STATE_ID, KIXObjectType.CONFIG_ITEM_VERSION
                )
            ],
            [
                VersionProperty.INCI_STATE_ID,
                await LabelService.getInstance().getPropertyText(
                    VersionProperty.INCI_STATE_ID, KIXObjectType.CONFIG_ITEM_VERSION
                )
            ],
            [
                VersionProperty.NAME,
                await LabelService.getInstance().getPropertyText(
                    VersionProperty.NAME, KIXObjectType.CONFIG_ITEM
                )
            ]
        ];

        const classIds = this.getClassIds();

        let classAttributes = [];
        if (classIds.length === 1) {
            classAttributes = await ConfigItemClassAttributeUtil.getMergedClassAttributeIds(classIds, false);
        }

        const superProperties = await super.getProperties();
        properties = [...properties, ...classAttributes, ...superProperties];

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        let inputFieldType: InputFieldTypes | string = InputFieldTypes.TEXT;
        switch (property) {
            case VersionProperty.DEPL_STATE_ID:
            case VersionProperty.INCI_STATE_ID:
                inputFieldType = InputFieldTypes.DROPDOWN;
                break;
            default:
                const classIds = this.getClassIds();
                const type = await ConfigItemClassAttributeUtil.getAttributeType(property, classIds);

                if (type === 'Date') {
                    inputFieldType = InputFieldTypes.DATE;
                } else if (type === 'DateTime') {
                    inputFieldType = InputFieldTypes.DATE_TIME;
                } else if (type === 'Text') {
                    inputFieldType = InputFieldTypes.TEXT;
                } else if (type === 'TextArea') {
                    inputFieldType = InputFieldTypes.TEXT_AREA;
                } else if (type === 'GeneralCatalog') {
                    inputFieldType = InputFieldTypes.DROPDOWN;
                } else if (type === 'CIClassReference') {
                    inputFieldType = InputFieldTypes.OBJECT_REFERENCE;
                } else if (type === 'Organisation' || type === 'Contact') {
                    inputFieldType = InputFieldTypes.OBJECT_REFERENCE;
                } else {
                    inputFieldType = await super.getInputType(type);
                }
        }

        return inputFieldType;
    }

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        switch (property) {
            case ConfigItemProperty.CLASS_ID:
            case VersionProperty.DEPL_STATE_ID:
            case VersionProperty.INCI_STATE_ID:
            case ConfigItemProperty.CHANGE_BY:
                return await CMDBService.getInstance().getTreeNodes(property, true, true);
            default:
                const classIds = this.getClassIds();
                const input = await ConfigItemClassAttributeUtil.getAttributeInput(property, classIds);

                if (input) {
                    if (input.Type === 'GeneralCatalog') {
                        const items = await CMDBService.getGeneralCatalogItems(input['Class'], objectIds);
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
    }

    public async searchObjectTree(
        property: string, searchValue: string, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        let tree = [];

        const classIds = this.getClassIds();
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(property, classIds);

        if (input.Type === 'CIClassReference') {
            const configItems = await CMDBService.loadConfigItemsByClassReference(input['ReferencedCIClassName'], searchValue, loadingOptions);
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

    private getClassIds(): number[] {
        const configItems = this.objects as ConfigItem[] || [];
        const classIds = configItems
            .map((ci) => ci.ClassID)
            .filter((classId: number, index: number, cids: number[]) => cids.indexOf(classId) === index);
        return classIds;
    }
}
