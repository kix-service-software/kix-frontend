/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ConfigItemClassAttributeUtil, ConfigItemDetailsContext } from '.';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../model/ContextMode';
import { ConfigItemAttachment } from '../../model/ConfigItemAttachment';
import { Version } from '../../model/Version';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { CreateConfigItemVersionOptions } from '../../model/CreateConfigItemVersionOptions';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { VersionProperty } from '../../model/VersionProperty';
import { GeneralCatalogItemProperty } from '../../../general-catalog/model/GeneralCatalogItemProperty';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { ConfigItemClassProperty } from '../../model/ConfigItemClassProperty';

export class CMDBService extends KIXObjectService<ConfigItem | ConfigItemImage> {

    private static INSTANCE: CMDBService = null;

    public static getInstance(): CMDBService {
        if (!CMDBService.INSTANCE) {
            CMDBService.INSTANCE = new CMDBService();
        }

        return CMDBService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.CONFIG_ITEM);
        this.objectConstructors.set(KIXObjectType.CONFIG_ITEM, [ConfigItem]);
        this.objectConstructors.set(KIXObjectType.CONFIG_ITEM_VERSION, [Version]);
        this.objectConstructors.set(KIXObjectType.CONFIG_ITEM_IMAGE, [ConfigItemImage]);
        this.objectConstructors.set(KIXObjectType.CONFIG_ITEM_CLASS, [ConfigItemClass]);
        this.objectConstructors.set(KIXObjectType.CONFIG_ITEM_ATTACHMENT, [ConfigItemAttachment]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM
            || kixObjectType === KIXObjectType.CONFIG_ITEM_VERSION
            || kixObjectType === KIXObjectType.CONFIG_ITEM_IMAGE
            || kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS
            || kixObjectType === KIXObjectType.CONFIG_ITEM_ATTACHMENT;
    }

    public getLinkObjectName(): string {
        return 'ConfigItem';
    }

    public async searchConfigItemsByClass(
        ciClassNames: string[], searchValue: string, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<ConfigItem[]> {
        if (!loadingOptions) {
            loadingOptions = new KIXObjectLoadingOptions(null, null, 50);
        }

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
        ], null, loadingOptions.limit);

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
        ], null, loadingOptions.limit);

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
            new FilterCriteria(`${GeneralCatalogItemProperty.PREFERENCES}.Name`, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'Functionality'),
            new FilterCriteria(`${GeneralCatalogItemProperty.PREFERENCES}.Value`, SearchOperator.NOT_EQUALS, FilterDataType.STRING,
                FilterType.AND, 'postproductive')
        ], undefined, undefined, [GeneralCatalogItemProperty.PREFERENCES]);

        const catalogItems = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
        );

        return catalogItems;
    }

    public async getAffactedIncidentStates(): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria('Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'ITSM::Core::IncidentState'),
            new FilterCriteria(`${GeneralCatalogItemProperty.PREFERENCES}.Name`, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'Functionality'),
            new FilterCriteria(`${GeneralCatalogItemProperty.PREFERENCES}.Value`, SearchOperator.IN, FilterDataType.STRING,
                FilterType.AND, ['warning', 'incident'])
        ], undefined, undefined, [GeneralCatalogItemProperty.PREFERENCES]);

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
            case VersionProperty.INCI_STATE_ID:
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
            case VersionProperty.DEPL_STATE_ID:
                const classId =
                    property === ConfigItemProperty.CUR_DEPL_STATE_ID || property === VersionProperty.DEPL_STATE_ID
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
                    let text = await LabelService.getInstance().getObjectText(i);
                    text = await TranslationService.translate(text);
                    nodes.push(new TreeNode(
                        i.ItemID, text, new ObjectIcon(null, KIXObjectType.GENERAL_CATALOG_ITEM, i.ItemID),
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
        const context = ContextService.getInstance().getActiveContext();
        return context.descriptor.urlPaths[0] + '/' + id;
    }

    protected getResource(objectType: KIXObjectType): string {
        if (objectType === KIXObjectType.CONFIG_ITEM) {
            return 'cmdb/configitems';
        } else {
            return super.getResource(objectType);
        }
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

    public async getObjectTypeForProperty(property: string): Promise<KIXObjectType | string> {
        let objectType;

        switch (property) {
            case 'OwnerContact':
                objectType = KIXObjectType.CONTACT;
                break;
            case 'OwnerOrganisation':
                objectType = KIXObjectType.ORGANISATION;
                break;
            default:
                objectType = KIXObjectType.CONFIG_ITEM;
        }
        return objectType;
    }

    public async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>, objectId: number | string,
        cacheKeyPrefix: string = objectType, silent?: boolean
    ): Promise<string | number> {
        if (objectType === KIXObjectType.CONFIG_ITEM) {

            const context = ContextService.getInstance().getActiveContext();
            if (context.descriptor.contextMode === ContextMode.EDIT_BULK) {
                parameter = await this.createParameterFromBulk(parameter, objectId);
            }

            await KIXObjectService.createObject(
                KIXObjectType.CONFIG_ITEM_VERSION, parameter,
                new CreateConfigItemVersionOptions(Number(objectId)), false
            );

            // trigger update because, config item is not really updated (SocketClient did not trigger event)
            if (!silent) {
                EventService.getInstance().publish(ApplicationEvent.OBJECT_UPDATED, { objectType, objectId });
            }
            return objectId;
        }
        return super.updateObject(objectType, parameter, objectId, cacheKeyPrefix, silent);
    }

    private async createParameterFromBulk(
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<Array<[string, any]>> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = [ConfigItemProperty.CURRENT_VERSION, VersionProperty.DATA];
        const cis = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, [objectId], loadingOptions
        ).catch((): ConfigItem[] => []);

        let configItem: ConfigItem;
        let versionData: any;

        if (Array.isArray(cis) && cis.length) {
            configItem = cis[0];
            versionData = configItem?.CurrentVersion?.Data;
        }

        const newParameter: Array<[string, any]> = [];
        for (const p of parameter) {
            if (
                p[0] === VersionProperty.DEPL_STATE_ID ||
                p[0] === VersionProperty.INCI_STATE_ID ||
                p[0] === ConfigItemProperty.NAME ||
                p[0] === KIXObjectProperty.LINKS
            ) {
                newParameter.push(p);
            } else {

                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null, [ConfigItemClassProperty.CURRENT_DEFINITION]
                );
                loadingOptions.cacheType = `${KIXObjectType.CONFIG_ITEM_CLASS}_DEFINITION`;

                const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
                    KIXObjectType.CONFIG_ITEM_CLASS, [configItem?.ClassID], loadingOptions
                );

                // determine attribute path and set value to version data
                if (ciClasses?.length) {
                    const path = await ConfigItemClassAttributeUtil.getAttributePath(p[0], configItem?.ClassID);
                    await this.setVersionData(versionData, path, p[1], ciClasses[0]);
                }
            }
        }

        newParameter.push([VersionProperty.DATA, versionData]);

        // Add default values from latest version if not defined in bulk form
        if (!newParameter.some((p) => p[0] === VersionProperty.DEPL_STATE_ID)) {
            newParameter.push([VersionProperty.DEPL_STATE_ID, configItem?.CurrentVersion?.DeplStateID]);
        }

        if (!newParameter.some((p) => p[0] === VersionProperty.INCI_STATE_ID)) {
            newParameter.push([VersionProperty.INCI_STATE_ID, configItem?.CurrentVersion?.InciStateID]);
        }

        if (!newParameter.some((p) => p[0] === VersionProperty.NAME)) {
            newParameter.push([VersionProperty.NAME, configItem?.CurrentVersion?.Name]);
        }

        return newParameter;
    }

    private async setVersionData(data: any, path: string, value: any, ciClass: ConfigItemClass): Promise<void> {
        if (data && path) {
            const pathArray = path?.split('.');
            let obj = data;
            const propertyIndex = pathArray.length - 1;

            for (let i = 0; i < propertyIndex; ++i) {
                const key = pathArray[i];

                const attribute = ConfigItemClassAttributeUtil.getAttribute(
                    ciClass?.CurrentDefinition?.Definition, key
                );

                let subStructure = obj[key];
                // Check for Array Value
                if (attribute.CountMax > 1) {
                    if (!Array.isArray(subStructure)) {
                        subStructure = [];
                    }

                    // check for hash value
                    if (attribute.Sub?.length) {
                        if (!subStructure.length) {
                            subStructure.push({});
                        }
                    }
                } else if (attribute.Sub?.length) {
                    if (typeof subStructure !== 'object') {
                        subStructure = {};
                    }
                }
                obj[key] = subStructure;
                obj = obj[key];
            }

            if (Array.isArray(obj)) {
                if (typeof obj[0] === 'object') {
                    obj[0][pathArray[propertyIndex]] = value;
                } else {
                    obj[0] = value;
                }
            } else {
                obj[pathArray[propertyIndex]] = value;
            }
        }
    }

    public async getObjectProperties(objectType: KIXObjectType): Promise<string[]> {
        const superProperties = await super.getObjectProperties(objectType);
        const objectProperties: string[] = [];
        if (objectType === KIXObjectType.CONFIG_ITEM) {
            for (const property in ConfigItemProperty) {
                if (ConfigItemProperty[property]) {
                    objectProperties.push(ConfigItemProperty[property]);
                }
            }
        }
        return [...objectProperties, ...superProperties];
    }

    public async getClasses(valid: boolean = true): Promise<ConfigItemClass[]> {
        let loadingOptions: KIXObjectLoadingOptions;
        if (valid) {
            loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
                )
            ]);
        }
        const classes = await this.loadObjects<ConfigItemClass>(KIXObjectType.CONFIG_ITEM_CLASS, null, loadingOptions)
            .catch(() => []);
        return classes;
    }

    public static async getGeneralCatalogItems(
        classId: number, objectIds?: Array<string | number>
    ): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                'Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, classId
            )
        ]);

        const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, objectIds, loadingOptions, null, false
        );
        return items;
    }

    public static async loadConfigItemsByClassReference(
        classReference: string[] | string, searchValue: string, loadingOptions: KIXObjectLoadingOptions
    ): Promise<ConfigItem[]> {
        const ciClassNames = Array.isArray(classReference) ? classReference : [classReference];

        const configItems = await CMDBService.getInstance().searchConfigItemsByClass(
            ciClassNames, searchValue, loadingOptions
        );
        return configItems;
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        const filter = [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];

        return filter;
    }
}
