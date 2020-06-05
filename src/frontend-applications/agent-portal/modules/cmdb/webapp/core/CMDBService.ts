/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItem } from '../../model/ConfigItem';
import { ConfigItemImage } from '../../model/ConfigItemImage';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { CreateConfigItemUtil } from './CreateConfigItemUtil';
import { CreateConfigItemVersionUtil } from './CreateConfigItemVersionUtil';
import { CreateConfigItemVersionOptions } from '../../model/CreateConfigItemVersionOptions';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';

import { GeneralCatalogItem } from '../../../general-catalog/model/GeneralCatalogItem';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { ConfigItemClass } from '../../model/ConfigItemClass';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ConfigItemDetailsContext } from '.';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../model/ContextMode';

export class CMDBService extends KIXObjectService<ConfigItem | ConfigItemImage> {

    private static INSTANCE: CMDBService = null;

    public static getInstance(): CMDBService {
        if (!CMDBService.INSTANCE) {
            CMDBService.INSTANCE = new CMDBService();
        }

        return CMDBService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONFIG_ITEM
            || kixObjectType === KIXObjectType.CONFIG_ITEM_VERSION
            || kixObjectType === KIXObjectType.CONFIG_ITEM_IMAGE
            || kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS
            || kixObjectType === KIXObjectType.CONFIG_ITEM_ATTACHMENT;
    }

    public getLinkObjectName(): string {
        return 'ConfigItem';
    }

    public async createConfigItem(formId: string, classId: number): Promise<string | number> {
        const parameter = await CreateConfigItemUtil.createParameter(formId, classId);
        const configItemId = await KIXObjectService.createObject(KIXObjectType.CONFIG_ITEM, parameter, null, false);
        return configItemId;
    }

    public async createConfigItemVersion(formId: string, configItemId: number): Promise<string | number> {
        const parameter = await CreateConfigItemVersionUtil.createParameter(formId);
        const versionId = await KIXObjectService.createObject(
            KIXObjectType.CONFIG_ITEM_VERSION, parameter, new CreateConfigItemVersionOptions(configItemId), false
        );
        return versionId;
    }

    public async searchConfigItemsByClass(
        ciClassNames: string[], searchValue: string, limit: number = 50
    ): Promise<ConfigItem[]> {
        const configItems = [];

        const loadingOptionsNumber = new KIXObjectLoadingOptions([
            new FilterCriteria(
                ConfigItemProperty.CLASS, SearchOperator.IN,
                FilterDataType.STRING, FilterType.AND, ciClassNames
            ),
            new FilterCriteria(
                ConfigItemProperty.NUMBER, SearchOperator.CONTAINS,
                FilterDataType.STRING, FilterType.AND, searchValue
            )
        ], null, limit);

        const configItemsByNumber = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, null, loadingOptionsNumber, null, false
        );

        const loadingOptionsName = new KIXObjectLoadingOptions([
            new FilterCriteria(
                ConfigItemProperty.CLASS, SearchOperator.IN,
                FilterDataType.STRING, FilterType.AND, ciClassNames
            ),
            new FilterCriteria(
                ConfigItemProperty.NAME, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.AND, `*${searchValue}*`
            )
        ], null, limit);

        const configItemsByName = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, null, loadingOptionsName, null, false
        );

        configItemsByNumber.forEach(
            (ci) => {
                if (!configItems.some((c) => c.ConfigItemID === ci.ConfigItemID)) {
                    configItems.push(ci);
                }
            });

        configItemsByName.forEach(
            (ci) => {
                if (!configItems.some((c) => c.ConfigItemID === ci.ConfigItemID)) {
                    configItems.push(ci);
                }
            });

        return configItems;
    }

    public async getDeploymentStates(): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria('Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'ITSM::ConfigItem::DeploymentState'),
            new FilterCriteria('Functionality', SearchOperator.NOT_EQUALS, FilterDataType.STRING,
                FilterType.AND, 'postproductive')
        ]);

        const catalogItems = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
        );

        return catalogItems;
    }

    public async getAffactedIncidentStates(): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria('Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'ITSM::Core::IncidentState'),
            new FilterCriteria('Functionality', SearchOperator.IN, FilterDataType.STRING,
                FilterType.AND, ['warning', 'incident'])
        ]);

        const catalogItems = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
        );

        return catalogItems;
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case ConfigItemProperty.CLASS_ID:
                let classes = await KIXObjectService.loadObjects<ConfigItemClass>(
                    KIXObjectType.CONFIG_ITEM_CLASS
                );
                classes = showInvalid ? classes : classes.filter((c) => c.ValidID === 1);
                nodes = [];
                for (const c of classes) {
                    const icon = LabelService.getInstance().getObjectIcon(c);
                    const text = await LabelService.getInstance().getObjectText(c);
                    nodes.push(
                        new TreeNode(
                            c.ID, text, icon,
                            undefined, undefined, undefined,
                            undefined, undefined, undefined, undefined, undefined, undefined,
                            c.ValidID === 1 || invalidClickable,
                            undefined, undefined, undefined, undefined,
                            c.ValidID !== 1
                        )
                    );
                }
                break;
            case ConfigItemProperty.CUR_INCI_STATE_ID:
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                const classId = property === ConfigItemProperty.CUR_DEPL_STATE_ID
                    ? 'ITSM::ConfigItem::DeploymentState'
                    : 'ITSM::Core::IncidentState';
                const loadingOptions = new KIXObjectLoadingOptions([
                    new FilterCriteria(
                        'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, classId
                    )]
                );

                const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                    KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null, false
                );

                for (const i of items) {
                    const text = await LabelService.getInstance().getObjectText(i);
                    nodes.push(new TreeNode(
                        i.ItemID, text, new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, i.ItemID),
                        undefined, undefined, undefined,
                        undefined, undefined, undefined, undefined, undefined, undefined,
                        i.ValidID === 1 || invalidClickable,
                        undefined, undefined, undefined, undefined,
                        i.ValidID !== 1
                    ));
                }
                break;
            default:
                nodes = await super.getTreeNodes(property, showInvalid, invalidClickable, filterIds);
        }

        return nodes;
    }

    public determineDependendObjects(configItems: ConfigItem[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.TICKET) {
            ids = this.getLinkedObjectIds(configItems, KIXObjectType.TICKET);
        } else if (targetObjectType === KIXObjectType.FAQ_ARTICLE) {
            ids = this.getLinkedObjectIds(configItems, KIXObjectType.FAQ_ARTICLE);
        } else {
            ids = super.determineDependendObjects(configItems, targetObjectType);
        }

        return ids;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = await ContextService.getInstance().getContext(ConfigItemDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

    protected getResource(objectType: KIXObjectType): string {
        if (objectType === KIXObjectType.CONFIG_ITEM) {
            return 'cmdb/configitems';
        } else {
            return super.getResource(objectType);
        }
    }

    public static async searchConfigItems(searchValue: string, limit?: number) {
        const filter = [
            new FilterCriteria(
                ConfigItemProperty.NUMBER, SearchOperator.CONTAINS,
                FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ConfigItemProperty.NAME, SearchOperator.CONTAINS,
                FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];

        const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit, [ConfigItemProperty.CURRENT_VERSION]);

        const configItems = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, null, loadingOptions
        );
        return configItems;
    }

    public getObjectRoutingConfiguration(object: KIXObject): RoutingConfiguration {
        if (object && object.KIXObjectType === KIXObjectType.CONFIG_ITEM_VERSION) {
            return null;
        }

        return new RoutingConfiguration(
            ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
            ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
        );
    }


    public async prepareFullTextFilter(searchValue): Promise<FilterCriteria[]> {
        searchValue = `*${searchValue}*`;

        return [
            new FilterCriteria(
                ConfigItemProperty.NUMBER, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ConfigItemProperty.NAME, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];
    }

}
