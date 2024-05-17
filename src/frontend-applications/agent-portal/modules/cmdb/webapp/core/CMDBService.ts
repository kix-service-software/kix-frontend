/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ObjectSearch } from '../../../object-search/model/ObjectSearch';
import { BackendSearchDataType } from '../../../../model/BackendSearchDataType';
import { Contact } from '../../../customer/model/Contact';
import { Organisation } from '../../../customer/model/Organisation';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';

export class CMDBService extends KIXObjectService<ConfigItem | ConfigItemImage> {

    private static INSTANCE: CMDBService = null;

    private classObjectType: RegExp;

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
        this.classObjectType = new RegExp(`${KIXObjectType.CONFIG_ITEM}\\..+`);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM
            || kixObjectType === KIXObjectType.CONFIG_ITEM_VERSION
            || kixObjectType === KIXObjectType.CONFIG_ITEM_IMAGE
            || kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS
            || kixObjectType === KIXObjectType.CONFIG_ITEM_ATTACHMENT
            || Boolean(kixObjectType?.match(this.classObjectType));
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
            new FilterCriteria('Functionality', SearchOperator.NOT_EQUALS, FilterDataType.STRING,
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
            new FilterCriteria('Functionality', SearchOperator.IN, FilterDataType.STRING,
                FilterType.AND, ['warning', 'incident'])
        ], undefined, undefined, [GeneralCatalogItemProperty.PREFERENCES]);

        const catalogItems = await KIXObjectService.loadObjects<GeneralCatalogItem>(
            KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
        );

        return catalogItems;
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        additionalData?: any
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
            case ConfigItemProperty.PREVIOUS_VERSION_SEARCH:
                const no = await TranslationService.translate('No');
                const yes = await TranslationService.translate('Yes');
                nodes = [
                    new TreeNode(0, no),
                    new TreeNode(1, yes)
                ];
                break;
            default:
                const dep: string = typeof additionalData === 'object' && additionalData['dep'] ?
                    additionalData['dep'] : undefined;
                if (dep) {
                    const input = await ConfigItemClassAttributeUtil.getAttributeInput(
                        property, [Number(dep)]
                    );
                    if (input) {
                        // GC also without filterIds possible (filtering in table column)
                        if (input.Type === 'GeneralCatalog') {
                            const items = await CMDBService.getGeneralCatalogItems(input['Class'], filterIds);
                            return items.map((item) => new TreeNode(
                                item.ItemID, item.Name,
                                new ObjectIcon(null, KIXObjectType.GENERAL_CATALOG_ITEM, item.ObjectId)
                            ));
                        }
                        // filterIds needed, because only relevant if column filter is set, else it will be autocomplete
                        else if (input.Type === 'Organisation' && filterIds) {
                            const organisations = await KIXObjectService.loadObjects<Organisation>(
                                KIXObjectType.ORGANISATION, filterIds
                            );
                            return await KIXObjectService.prepareTree(organisations);
                        } else if (input.Type === 'Contact' && filterIds) {
                            const contacts = await KIXObjectService.loadObjects<Contact>(
                                KIXObjectType.CONTACT, filterIds
                            );
                            return await KIXObjectService.prepareTree(contacts);
                        } else if (input.Type === 'CIClassReference' && filterIds) {
                            const items = await KIXObjectService.loadObjects<ConfigItem>(
                                KIXObjectType.CONFIG_ITEM, filterIds
                            );
                            return await KIXObjectService.prepareTree(items);
                        }
                    }
                }
                nodes = await super.getTreeNodes(property, showInvalid, invalidClickable, filterIds);
        }

        return nodes;
    }

    public async searchObjectTree(
        property: string, searchValue: string, loadingOptions?: KIXObjectLoadingOptions, additionalData?: any
    ): Promise<TreeNode[]> {
        const dep: string = typeof additionalData === 'object' && additionalData['dep'] ?
            additionalData['dep'] : undefined;
        if (dep) {
            // get input of relevant class
            const input = await ConfigItemClassAttributeUtil.getAttributeInput(property, [Number(dep)]);
            if (input) {
                if (input.Type === 'CIClassReference') {
                    const configItems = await CMDBService.loadConfigItemsByClassReference(
                        input['ReferencedCIClassName'], searchValue, loadingOptions
                    );
                    return configItems.map(
                        (ci) => new TreeNode(
                            ci.ConfigItemID, ci.Name, new ObjectIcon(null, ci.KIXObjectType, ci.ConfigItemID)
                        )
                    );
                } else if (input.Type === 'Organisation') {
                    const organisations = await KIXObjectService.search(
                        KIXObjectType.ORGANISATION, searchValue, loadingOptions
                    );
                    return await KIXObjectService.prepareTree(organisations);
                } else if (input.Type === 'Contact') {
                    const contacts = await KIXObjectService.search(
                        KIXObjectType.CONTACT, searchValue, loadingOptions
                    );
                    return await KIXObjectService.prepareTree(contacts);
                }
            }
        }

        return super.searchObjectTree(property, searchValue, loadingOptions);
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
        let objectType = await super.getObjectTypeForProperty(property);

        if (objectType === this.objectType) {
            switch (property) {
                case 'OwnerContact':
                    objectType = KIXObjectType.CONTACT;
                    break;
                case 'OwnerOrganisation':
                    objectType = KIXObjectType.ORGANISATION;
                    break;
                default:
            }
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
                SearchProperty.FULLTEXT, SearchOperator.LIKE, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];

        return filter;
    }

    public async getSortableAttributes(filtered: boolean = true): Promise<ObjectSearch[]> {
        const supportedAttributes = await super.getSortableAttributes(filtered);

        const filterList = [
            ConfigItemProperty.CLASS_ID,
            'ClassIDs',
            ConfigItemProperty.CONFIG_ITEM_ID,
            'DeplStateID',
            'DeplStateIDs',
            'DeplState',
            'InciStateID',
            'InciStateIDs',
            'InciState'
        ];
        // use frontend "known" attribute
        const deplState = supportedAttributes.find((sA) => sA.Property === 'DeplStateID');
        if (deplState) {
            deplState.Property = ConfigItemProperty.CUR_DEPL_STATE_ID;
        }
        const inciState = supportedAttributes.find((sA) => sA.Property === 'InciStateID');
        if (inciState) {
            inciState.Property = ConfigItemProperty.CUR_INCI_STATE_ID;
        }
        return filtered ?
            supportedAttributes.filter((sA) => !filterList.some((fp) => fp === sA.Property)) :
            supportedAttributes;
    }

    public getSortAttribute(attribute: string, dep?: string): string {
        switch (attribute) {
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                return 'DeplState';
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                return 'InciState';
            case ConfigItemProperty.CLASS_ID:
                return ConfigItemProperty.CLASS;
            default:
        }
        return super.getSortAttribute(attribute, dep);
    }

    protected async isBackendFilterSupportedForProperty(
        objectType: KIXObjectType | string, property: string, supportedAttributes: ObjectSearch[], dep?: string
    ): Promise<boolean> {

        const filterList = [
            ConfigItemProperty.CONFIG_ITEM_ID,
            ConfigItemProperty.CHANGE_BY,
            ConfigItemProperty.CHANGE_TIME,
            ConfigItemProperty.CUR_INCI_STATE_ID,
            ConfigItemProperty.CUR_INCI_STATE,
            ConfigItemProperty.CUR_INCI_STATE_TYPE,
            ConfigItemProperty.CLASS_ID,
            ConfigItemProperty.CLASS,
            ConfigItemProperty.CREATE_BY,
            ConfigItemProperty.CREATE_TIME,
            ConfigItemProperty.CUR_DEPL_STATE_ID,
            ConfigItemProperty.CUR_DEPL_STATE,
            ConfigItemProperty.CUR_DEPL_STATE_TYPE,
            ConfigItemProperty.NUMBER,
            ConfigItemProperty.NAME
        ];
        if (!dep && !filterList.some((f) => f === property)) {
            return false;
        }

        if (dep) {
            const classIds = [Number(dep)];
            const type = await this.getAttributeType(property, classIds);
            if (type) {
                switch (type) {
                    case 'Date':
                    case 'DateTime':
                    case 'Attachment':
                    case 'Dummy':
                        return false;
                    default:
                }
                const filterAttribute = await ConfigItemClassAttributeUtil.getAttributePath(property, classIds);
                if (filterAttribute) {
                    property = `CurrentVersion.Data.${filterAttribute}`;
                }
            }
        }
        return super.isBackendFilterSupportedForProperty(objectType, property, supportedAttributes, dep);
    }

    protected async getBackendFilterType(property: string, dep?: string): Promise<BackendSearchDataType | string> {
        if (dep) {
            const type = await this.getAttributeType(property, [Number(dep)]);
            if (type) {
                switch (type) {
                    case 'GeneralCatalog':
                        return BackendSearchDataType.NUMERIC;
                    case 'Contact':
                    case 'Organisation':
                    case 'CIClassReference':
                        return 'Autocomplete';
                    default:
                        return BackendSearchDataType.TEXTUAL;
                }
            }
        }
        return super.getBackendFilterType(property, dep);
    }

    public async getFilterAttribute(attribute: string, dep?: string): Promise<string> {
        const classIds = dep ? [Number(dep)] : null;
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(attribute, classIds);
        if (input) {
            const filterAttribute = await ConfigItemClassAttributeUtil.getAttributePath(attribute, classIds);
            if (filterAttribute) {
                return `CurrentVersion.Data.${filterAttribute}`;
            }
        }
        return super.getFilterAttribute(attribute, dep);
    }

    public async getFilterAttributeForFilter(property: string, dep?: string): Promise<string> {
        // if class specific attribute (dep = classId), use it as given
        if (dep) {
            return property;
        }
        return super.getFilterAttributeForFilter(property, dep);
    }

    private async getAttributeType(property: string, classIds: number[]): Promise<string> {
        const input = await ConfigItemClassAttributeUtil.getAttributeInput(property, classIds);
        if (input) {
            return input.Type;
        }
        return;
    }

    public async getObjectProperties(objectType: KIXObjectType, dependencyIds: string[] = []): Promise<string[]> {
        const superProperties = await super.getObjectProperties(objectType);

        const objectProperties: string[] = [];
        if (objectType === KIXObjectType.CONFIG_ITEM) {
            objectProperties.push(...[
                ConfigItemProperty.NUMBER,
                ConfigItemProperty.NAME,
                ConfigItemProperty.CUR_DEPL_STATE_ID,
                ConfigItemProperty.CUR_INCI_STATE_ID,
                ConfigItemProperty.CLASS_ID
            ]);
        }
        objectProperties.push(...[
            KIXObjectProperty.CHANGE_TIME,
            KIXObjectProperty.CHANGE_BY,
            KIXObjectProperty.CREATE_TIME,
            KIXObjectProperty.CREATE_BY
        ]);

        if (dependencyIds?.length) {
            const classAttributes = await ConfigItemClassAttributeUtil.getMergedClassAttributeIds(
                dependencyIds.map((d) => Number(d))
            );
            objectProperties.push(...classAttributes.map((a) => a[0]));
        }

        return [...objectProperties, ...superProperties];
    }

    public async getObjectDependencies(objectType: KIXObjectType): Promise<KIXObject[]> {
        return this.getClasses();
    }

    public async getObjectDependencyName(objectType: KIXObjectType | string): Promise<string> {
        return LabelService.getInstance().getPropertyText(ConfigItemProperty.CLASS, objectType);
    }

}
