/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ServiceType } from './ServiceType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { ServiceRegistry } from './ServiceRegistry';
import { ComponentContent } from './ComponentContent';
import { OverlayService } from './OverlayService';
import { OverlayType } from './OverlayType';
import { KIXObjectSocketClient } from './KIXObjectSocketClient';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectSpecificDeleteOptions } from '../../../../model/KIXObjectSpecificDeleteOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { TreeNode } from './tree';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { User } from '../../../user/model/User';
import { ValidObject } from '../../../valid/model/ValidObject';
import { UIFilterCriterion } from '../../../../model/UIFilterCriterion';
import { IAutofillConfiguration } from './IAutofillConfiguration';
import { AuthenticationSocketClient } from './AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { LabelService } from './LabelService';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { IKIXObjectService } from './IKIXObjectService';
import { Error } from '../../../../../../server/model/Error';
import { DynamicFieldProperty } from '../../../dynamic-fields/model/DynamicFieldProperty';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { UserProperty } from '../../../user/model/UserProperty';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { ConfigItem } from '../../../cmdb/model/ConfigItem';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { ExtendedKIXObjectService } from './ExtendedKIXObjectService';
import { ContactProperty } from '../../../customer/model/ContactProperty';
import { KIXObjectFormService } from './KIXObjectFormService';
import { ObjectSearchLoadingOptions } from '../../../object-search/model/ObjectSearchLoadingOptions';
import { ObjectSearch } from '../../../object-search/model/ObjectSearch';
import { BackendSearchDataType } from '../../../../model/BackendSearchDataType';
import { ValidIDProperty } from './ValidIDProperty';

export abstract class KIXObjectService<T extends KIXObject = KIXObject> implements IKIXObjectService<T> {

    private extendedServices: ExtendedKIXObjectService[] = [];

    // tslint:disable-next-line: ban-types
    protected objectConstructors: Map<KIXObjectType | string, Array<new (object?: KIXObject) => KIXObject>> = new Map();

    public addExtendedService(service: ExtendedKIXObjectService): void {
        this.extendedServices.push(service);
    }

    public addObjectConstructor(objectType: KIXObjectType | string, oc: new (object?: KIXObject) => KIXObject): void {
        if (!this.objectConstructors.has(objectType)) {
            this.objectConstructors.set(objectType, []);
        }

        this.objectConstructors.get(objectType).push(oc);
    }

    protected constructor(public objectType: KIXObjectType | string) {

    }

    public abstract isServiceFor(kixObjectType: KIXObjectType | string): boolean;

    public getLinkObjectName(): string {
        return null;
    }

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.OBJECT;
    }

    public static createObjectInstance<O>(objectType: KIXObjectType | string, object: O): O {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            object = service.createObjectInstance(objectType, object);
        } else {
            const errorMessage = `No service registered for object type ${objectType}`;
            console.warn(errorMessage);
        }
        return object;
    }

    protected createObjectInstance<O>(objectType: KIXObjectType | string, object: O): O {
        const objectConstructors = this.getObjectConstructors(objectType);
        objectConstructors.forEach((c) => object = new c(object));
        return object;
    }

    public static async loadDisplayValue(
        objectType: KIXObjectType | string, objectId: string | number
    ): Promise<string> {
        return KIXObjectSocketClient.getInstance().loadDisplayValue(objectType, objectId);
    }

    public static async loadObjects<T extends KIXObject>(
        objectType: KIXObjectType | string, objectIds?: Array<number | string>,
        loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions, silent: boolean = false,
        cache: boolean = true, forceIds?: boolean, collectionId?: string
    ): Promise<T[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        let objects = [];
        if (service) {
            objects = await service.loadObjects(
                objectType, objectIds ? [...objectIds] : null, loadingOptions, objectLoadingOptions, cache, forceIds,
                silent, collectionId
            ).catch((error: Error) => {
                if (!silent && error?.Code !== 'SILENT') {
                    // TODO: Publish event to show an error dialog
                    const content = new ComponentContent('list-with-title',
                        {
                            title: `Error load object (${objectType}):`,
                            list: [`${error.Code}: ${error.Message}`]
                        }
                    );
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, '', null, true
                    );
                }
                return [];
            });
        } else {
            const errorMessage = `No service registered for object type ${objectType}`;
            console.warn(errorMessage);
        }
        return objects;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        const objectConstructors = this.getObjectConstructors(objectType);

        let objects = [];
        if (objectIds) {
            if (objectIds.length) {
                objects = await KIXObjectSocketClient.getInstance().loadObjects<T>(
                    objectType, objectConstructors, objectIds, loadingOptions, objectLoadingOptions, cache,
                    undefined, silent, collectionId
                );
            }
        } else {
            objects = await KIXObjectSocketClient.getInstance().loadObjects<T>(
                objectType, objectConstructors, objectIds, loadingOptions, objectLoadingOptions, cache,
                undefined, silent, collectionId
            );
        }
        return objects;
    }

    protected getObjectConstructors(objectType: KIXObjectType | string): any[] {
        let objectConstructors = [];
        if (this.objectConstructors.has(objectType)) {
            objectConstructors = this.objectConstructors.get(objectType);
        }

        for (const extendedService of this.extendedServices) {
            const extendedConstructors = extendedService.getObjectConstructors();
            if (Array.isArray(extendedConstructors)) {
                objectConstructors = [
                    ...objectConstructors,
                    ...extendedConstructors
                ];
            }
        }
        return objectConstructors;
    }

    public static async createObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions,
        catchError: boolean = true, cacheKeyPrefix: string = objectType
    ): Promise<any> {
        const objectId = await KIXObjectSocketClient.getInstance().createObject(
            objectType, parameter, createOptions, cacheKeyPrefix
        ).catch(async (error: Error) => {
            if (catchError) {
                // TODO: Publish event to show an error dialog
                const content = new ComponentContent('list-with-title',
                    {
                        title: 'Translatable#Error on create:',
                        list: [`${error.Code}: ${error.Message}`]
                    }
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                );
                return null;
            } else {
                throw error;
            }
        });
        return objectId;
    }

    public async createObject(
        objectType: KIXObjectType | string, object: KIXObject, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(objectType, ServiceType.FORM);
        let parameter = [];
        if (service) {
            parameter = service.prepareCreateParameter(object);
        }
        const objectId = await KIXObjectSocketClient.getInstance().createObject(
            objectType, parameter, createOptions, cacheKeyPrefix
        );
        return objectId;
    }

    public static createObjectByForm(
        objectType: KIXObjectType | string, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return service.createObjectByForm(objectType, formId, createOptions, cacheKeyPrefix);
    }

    public async createObjectByForm(
        objectType: KIXObjectType | string, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(objectType, ServiceType.FORM);
        const parameter: Array<[string, any]> = await service.getFormParameter(false, createOptions);
        const objectId = await KIXObjectSocketClient.getInstance().createObject(
            objectType, parameter, createOptions, cacheKeyPrefix
        );
        return objectId;
    }

    public static async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>, objectId: number | string,
        catchError: boolean = true, cacheKeyPrefix: string = objectType, silent?: boolean
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);

        const updatedObjectId = await service.updateObject(objectType, parameter, objectId, cacheKeyPrefix, silent)
            .catch((error: Error) => {
                if (catchError) {
                    // TODO: Publish event to show an error dialog
                    const content = new ComponentContent('list-with-title',
                        {
                            title: 'Translatable#Error on update:',
                            list: [`${error.Code}: ${error.Message}`]
                        }
                    );
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                    );
                    return null;
                } else {
                    throw error;
                }
            });
        return updatedObjectId;
    }

    public async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>, objectId: number | string,
        cacheKeyPrefix: string = objectType, silent?: boolean
    ): Promise<string | number> {
        const updatedObjectId = await KIXObjectSocketClient.getInstance().updateObject(
            objectType, parameter, objectId, null, cacheKeyPrefix, silent
        );

        return updatedObjectId;
    }

    public static updateObjectByForm(
        objectType: KIXObjectType | string, formId: string, objectId: number | string,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return service.updateObjectByForm(objectType, formId, objectId, cacheKeyPrefix);
    }

    public async updateObjectByForm(
        objectType: KIXObjectType | string, formId: string, objectId: number | string,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        if (!objectId) {
            throw new Error(null, `Can not update "${objectType}". No objectId given`);
        }
        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(objectType, ServiceType.FORM);
        const parameter: Array<[string, any]> = await service.getFormParameter(true);

        const updatedObjectId = await this.updateObject(
            objectType, parameter, objectId, cacheKeyPrefix
        );

        for (const extendedService of this.extendedServices) {
            await extendedService.postUpdateObjectByForm(updatedObjectId, objectType);
        }
        return updatedObjectId;
    }

    public static async deleteObject(
        objectType: KIXObjectType | string, objectIds: Array<number | string>,
        deleteOptions?: KIXObjectSpecificDeleteOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<Array<number | string>> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        const errors: string[] = [];
        const failIds: Array<number | string> = [];
        for (const objectId of objectIds) {
            await service.deleteObject(objectType, objectId, deleteOptions, cacheKeyPrefix)
                .catch((error: Error) => {
                    errors.push(`${error.Code}: ${error.Message}`);
                    failIds.push(objectId);
                });
        }
        if (errors.length) {
            // TODO: Publish event to show an error dialog
            const content = new ComponentContent('list-with-title',
                {
                    title: `Fehler beim Löschen (${objectType}):`,
                    list: errors
                }
            );
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
            );
        }
        return failIds;
    }

    public async deleteObject(
        objectType: KIXObjectType | string, objectId: string | number, deleteOptions: KIXObjectSpecificDeleteOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<void> {
        await KIXObjectSocketClient.getInstance().deleteObject(objectType, objectId, deleteOptions, cacheKeyPrefix);
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        return [];
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        additionalData?: any
    ): Promise<TreeNode[]> {
        for (const extendedService of this.extendedServices) {
            const extendedNodes = await extendedService.getTreeNodes(
                property, showInvalid, invalidClickable, filterIds, loadingOptions, objectLoadingOptions,
                additionalData
            );
            if (extendedNodes) {
                return extendedNodes;
            }
        }

        let nodes: TreeNode[] = [];

        switch (property) {
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                let userIds: number[] = null;
                if (Array.isArray(filterIds)) {
                    userIds = filterIds.filter((id) => !isNaN(Number(id))).map((id) => Number(id));
                }
                let users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, userIds,
                    new KIXObjectLoadingOptions(
                        null, null, null, [UserProperty.CONTACT]
                    ), null, true
                ).catch((error) => [] as User[]);
                if (!showInvalid) {
                    users = users.filter((s) => s.ValidID === 1);
                }
                users.forEach((u) => nodes.push(new TreeNode(
                    u.UserID, u.Contact ? u.Contact.Fullname : u.UserLogin, 'kix-icon-man',
                    undefined, undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined,
                    u.ValidID === 1 || invalidClickable,
                    undefined, undefined, undefined, undefined,
                    u.ValidID !== 1
                )));
                break;
            case KIXObjectProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                nodes = [];
                for (const vo of validObjects) {
                    const text = await LabelService.getInstance().getObjectText(vo);
                    nodes.push(new TreeNode(Number(vo.ID), text));
                }
                break;
            default:
                const dfName = KIXObjectService.getDynamicFieldName(property);
                if (dfName) {
                    nodes = await this.getNodesForDF(dfName, filterIds);
                }
        }
        return nodes;
    }

    private async getNodesForDF(name: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const field = await KIXObjectService.loadDynamicField(name);
        if (field) {
            if (field.FieldType === DynamicFieldTypes.SELECTION && field.Config && field.Config.PossibleValues) {
                for (const pv in field.Config.PossibleValues) {
                    if (field.Config.PossibleValues[pv]) {
                        const value = field.Config.PossibleValues[pv];
                        const node = new TreeNode(pv, value);
                        nodes.push(node);
                    }
                }
            } else if (field.FieldType === DynamicFieldTypes.CI_REFERENCE && objectIds) {
                const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                    KIXObjectType.CONFIG_ITEM, objectIds
                );

                nodes = configItems.map(
                    (ci) => new TreeNode(
                        ci.ConfigItemID, ci.Name, 'kix-icon-ci'
                    )
                );

            }
        }
        return nodes;
    }

    public static async checkFilterValue(
        objectType: KIXObjectType | string, object: KIXObject, criteria: UIFilterCriterion
    ): Promise<boolean> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return service ? await service.checkFilterValue(object, criteria) : true;
    }

    public async checkFilterValue(object: T, criteria: UIFilterCriterion): Promise<boolean> {
        return true;
    }

    public determineDependendObjects(
        sourceObjects: T[], targetObjectType: KIXObjectType | string
    ): string[] | number[] {
        return [];
    }

    public async getAutoFillConfiguration(textMatch: any, placeholder: string): Promise<IAutofillConfiguration> {
        return null;
    }

    protected getLinkedObjectIds(
        kixObjects: KIXObject[], linkedObjectType: KIXObjectType | string
    ): string[] | number[] {
        const ids = [];
        for (const object of kixObjects) {
            if (object.Links) {
                const objectLinks = object.Links.filter(
                    (link) => link.SourceObject === linkedObjectType ||
                        link.TargetObject === linkedObjectType
                );
                for (const link of objectLinks) {
                    const ciId = link.SourceObject === linkedObjectType ? link.SourceKey : link.TargetKey;
                    if (!ids.some((id) => id === ciId)) {
                        ids.push(ciId);
                    }
                }
            }
        }
        return ids;
    }

    public static async getObjectUrl(object: KIXObject): Promise<string> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(object.KIXObjectType);
        return service ? service.getObjectUrl(object) : null;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        return '';
    }

    public async hasReadPermissionFor(objectType: KIXObjectType | string): Promise<boolean> {
        const resource = this.getResource(objectType);
        return await AuthenticationSocketClient.getInstance().checkPermissions([
            new UIComponentPermission(resource, [CRUD.READ])
        ]);
    }

    protected getResource(objectType: KIXObjectType | string): string {
        return objectType.toLocaleLowerCase();
    }

    public static async prepareObjectTree(
        objectType: KIXObjectType | string, objects: KIXObject[], showInvalid?: boolean,
        invalidClickable?: boolean, filterIds?: Array<string | number>, translatable?: boolean, useTextAsId?: boolean
    ): Promise<TreeNode[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        const nodes = await service?.prepareObjectTree(
            objects, showInvalid, invalidClickable, filterIds, translatable, useTextAsId
        ) || [];
        return nodes;
    }

    public async prepareObjectTree(
        objects: KIXObject[], showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>,
        translatable?: boolean, useTextAsId?: boolean
    ): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (objects && !!objects.length) {

            objects = objects.filter((o) => {
                const valid = showInvalid || typeof o.ValidID === 'undefined' || o.ValidID === 1;
                let match = true;
                if (Array.isArray(filterIds) && filterIds.length) {
                    match = !filterIds.some((id) => id?.toString() === o.ObjectId?.toString());
                }

                return valid && match;
            });

            for (const o of objects) {
                const label = await LabelService.getInstance().getObjectText(o, true, true, translatable);
                const icon = LabelService.getInstance().getObjectIcon(o);
                nodes.push(new TreeNode(o.ObjectId, label, icon));
            }
        }
        return nodes;
    }

    public static async search(
        objectType: KIXObjectType | string, searchValue: string, loadingOptions?: KIXObjectLoadingOptions,
        additionalFilter?: FilterCriteria[], onlyValidObjects: boolean = false
    ): Promise<KIXObject[]> {
        let result = [];
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            let filter = await service.prepareFullTextFilter(searchValue);
            if (onlyValidObjects) {
                filter.push(new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
                ));
            }
            if (Array.isArray(additionalFilter)) {
                filter = filter.concat(additionalFilter);
            }

            if (!loadingOptions) {
                loadingOptions = new KIXObjectLoadingOptions(filter, null, 10);
            } else if (Array.isArray(loadingOptions.filter)) {
                loadingOptions.filter = loadingOptions.filter.concat(filter);
            } else {
                loadingOptions.filter = filter;
            }
            result = await service.loadObjects(objectType, null, loadingOptions);
        }
        return result;
    }

    public static async prepareTree(
        objects: KIXObject[], showInvalid: boolean = true, invalidClickable: boolean = true
    ): Promise<TreeNode[]> {
        const nodes = [];

        for (const o of objects) {
            if (typeof o.ValidID === 'undefined' || o.ValidID === 1 || showInvalid) {
                const icon = await LabelService.getInstance().getObjectIcon(o);
                const text = await LabelService.getInstance().getObjectText(o);
                nodes.push(new TreeNode(
                    o.ObjectId, text, icon, undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    typeof o.ValidID === 'undefined' || o.ValidID === 1 || invalidClickable,
                    undefined, undefined, undefined, undefined,
                    typeof o.ValidID !== 'undefined' && o.ValidID !== 1
                ));
            }
        }

        return nodes;
    }

    public static async loadDynamicField(name: string, id?: number | string, valid?: boolean): Promise<DynamicField> {
        let dynamicField: DynamicField;
        if (name || id) {
            const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, id ? [id] : null,
                new KIXObjectLoadingOptions(
                    null, null, null, [DynamicFieldProperty.CONFIG]
                ), null, true
            ).catch(() => [] as DynamicField[]);

            if (id && dynamicFields?.length) {
                dynamicField = dynamicFields[0];
            } else if (Array.isArray(dynamicFields) && dynamicFields.length) {
                // use string, if name contains only numbers
                dynamicField = dynamicFields.find((df) => df.Name.toString() === name.toString());
            }
        }

        if (valid && dynamicField?.ValidID !== 1) {
            dynamicField = null;
        }

        return dynamicField;
    }

    public static async loadDynamicFields(objectType): Promise<DynamicField[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS,
                FilterDataType.STRING, FilterType.AND, objectType
            ),
            new FilterCriteria(
                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                FilterDataType.NUMERIC, FilterType.AND, 1
            )
        ]);
        const dynamicFields = KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        ).catch(() => []);

        return dynamicFields;
    }

    public static getDynamicFieldName(property: string): string {
        let name: string;
        if (property && KIXObjectService.isDynamicFieldProperty(property)) {
            name = property.replace(/^DynamicFields?\.(.+)/, '$1');
        }
        return name;
    }

    public static isDynamicFieldProperty(property: string): boolean {
        return typeof property === 'string' && Boolean(property.match(/^DynamicFields?\..+/));
    }

    public getObjectRoutingConfiguration(object: KIXObject): RoutingConfiguration {
        return null;
    }

    public async getTicketArticleEventTree(): Promise<TreeNode[]> {
        const ticketEvents = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_EVENTS], null, null, true
        ).catch((error): SysConfigOption[] => []);
        const articleEvents = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
        ).catch((error): SysConfigOption[] => []);

        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    DynamicFieldProperty.OBJECT_TYPE, SearchOperator.IN, FilterDataType.STRING,
                    FilterType.AND, [KIXObjectType.TICKET, KIXObjectType.ARTICLE]
                )
            ], undefined, 0
        );
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions, null, true
        ).catch(() => [] as DynamicField[]);

        const dfEvents = dynamicFields ? dynamicFields.map((d) => `${d.ObjectType}DynamicFieldUpdate_${d.Name}`) : [];

        return this.prepareEventTree(ticketEvents, articleEvents, dfEvents);
    }

    private prepareEventTree(
        ticketEvents: SysConfigOption[], articleEvents: SysConfigOption[], dfEvents: string[]
    ): TreeNode[] {
        let nodes = [];
        if (ticketEvents && ticketEvents.length) {
            nodes = ticketEvents[0].Value.map((event: string) => {
                return new TreeNode(event, event);
            });
        }
        if (articleEvents && articleEvents.length) {
            nodes = [
                ...nodes,
                ...articleEvents[0].Value.map((event: string) => {
                    return new TreeNode(event, event);
                })
            ];
        }
        if (dfEvents && dfEvents.length) {
            nodes = [
                ...nodes,
                ...dfEvents.sort().map((event: string) => {
                    return new TreeNode(event, event);
                })
            ];
        }
        return nodes;
    }

    public static async searchObjectTree(
        objectType: KIXObjectType | string, property: string, searchValue: string,
        loadingOptions?: KIXObjectLoadingOptions, additionalData?: any, showInvalid: boolean = true
    ): Promise<TreeNode[]> {

        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            return service.searchObjectTree(property, searchValue, loadingOptions, additionalData, showInvalid);
        }
    }

    public async searchObjectTree(
        property: string,
        searchValue: string,
        loadingOptions?: KIXObjectLoadingOptions,
        additionalData?: any,
        showInvalid: boolean = true
    ): Promise<TreeNode[]> {
        const objectTypeForSearch = await this.getObjectTypeForProperty(property);
        const objects = await KIXObjectService.search(objectTypeForSearch, searchValue, loadingOptions);
        return KIXObjectService.prepareTree(objects, showInvalid, showInvalid);
    }

    public static async getObjectTypeForProperty(
        objectType: KIXObjectType | string, property: string, useOwnTypeFallback?: boolean
    ): Promise<KIXObjectType | string> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            return service.getObjectTypeForProperty(property, useOwnTypeFallback);
        }
    }

    public async getObjectTypeForProperty(
        property: string, useOwnTypeFallback: boolean = true
    ): Promise<KIXObjectType | string> {
        let objectType = useOwnTypeFallback ? this.objectType : null;

        for (const extendedService of this.extendedServices) {
            const extentedObjectType = await extendedService.getObjectTypeForProperty(property);
            if (extentedObjectType) {
                return extentedObjectType;
            }
        }

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            objectType = null;
            const dynamicField = await KIXObjectService.loadDynamicField(dfName);
            if (dynamicField) {
                if (dynamicField.FieldType === DynamicFieldTypes.CI_REFERENCE) {
                    objectType = KIXObjectType.CONFIG_ITEM;
                } else if (dynamicField.FieldType === DynamicFieldTypes.TICKET_REFERENCE) {
                    objectType = KIXObjectType.TICKET;
                }
            }
        } else {
            switch (property) {
                case KIXObjectProperty.CREATE_BY:
                case KIXObjectProperty.CHANGE_BY:
                    objectType = KIXObjectType.USER;
                    break;
                case ContactProperty.PRIMARY_ORGANISATION_ID:
                    objectType = KIXObjectType.ORGANISATION;
                    break;
                default:
            }
        }
        return objectType;
    }

    public static async getObjectProperties(
        objectType: KIXObjectType, dependencyIds: string[] = []
    ): Promise<string[]> {
        let properties: string[] = [];
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(objectType);
        if (service) {
            properties = await service.getObjectProperties(objectType, dependencyIds);
            properties = await service.filterObjectProperties(objectType, properties, dependencyIds);
        }

        return properties;
    }

    public static async getObjectDependencies(
        objectType: KIXObjectType, showInvalid: boolean = true
    ): Promise<KIXObject[]> {
        let dependencies: KIXObject[] = [];

        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(objectType);
        if (service) {
            dependencies = await service.getObjectDependencies(objectType);
        }

        if (!showInvalid) {
            const filtered = dependencies.filter(
                (dependency) => Number(dependency.ValidID) === ValidIDProperty.VALID
            );
            dependencies = filtered;
        }

        return dependencies;
    }

    public async getObjectProperties(objectType: KIXObjectType, dependencyIds: string[] = []): Promise<string[]> {
        let properties: string[] = [];
        const dynamicFields: DynamicField[] = await KIXObjectService.loadDynamicFields(objectType);
        if (Array.isArray(dynamicFields) && dynamicFields.length) {
            properties = dynamicFields.map((df) => `DynamicFields.${df.Name}`);
        }
        for (const extendedService of this.extendedServices) {
            const extendedNodes = await extendedService.getObjectProperties(objectType, dependencyIds);
            if (extendedNodes?.length) {
                properties.push(...extendedNodes);
            }
        }
        return properties;
    }

    public async filterObjectProperties(
        objectType: KIXObjectType, properties: string[], dependencyIds: string[] = []
    ): Promise<string[]> {
        for (const extendedService of this.extendedServices) {
            properties = await extendedService.filterObjectProperties(objectType, properties, dependencyIds);
        }
        return properties;
    }

    public async getObjectDependencies(objectType: KIXObjectType): Promise<KIXObject[]> {
        let dependencies: KIXObject[] = [];

        for (const extendedService of this.extendedServices) {
            const extendedDependencies = await extendedService.getObjectDependencies(objectType);
            if (extendedDependencies?.length) {
                dependencies.push(...extendedDependencies);
            }
        }
        return dependencies;
    }

    public static async getObjectDependencyName(objectType: KIXObjectType | string): Promise<string> {
        let dependencyName: string = '';
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(objectType);
        if (service) {
            dependencyName = await service.getObjectDependencyName(objectType);
        }

        return dependencyName;
    }

    public async getObjectDependencyName(objectType: KIXObjectType | string): Promise<string> {
        for (const extendedService of this.extendedServices) {
            const extendedName = await extendedService.getObjectDependencyName(objectType);
            if (extendedName) {
                return extendedName;
            }
        }
        return objectType;
    }

    protected async shouldPreload(objectType: KIXObjectType | string): Promise<boolean> {
        let preload = false;
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.SYS_CONFIG_OPTION);
        if (service) {
            const agentPortalConfig = await (service as any).getPortalConfiguration();
            preload = agentPortalConfig?.preloadObjects?.some((o) => o === objectType) || false;
        }
        return preload;
    }

    public static async getSortableAttributes(
        objectType: KIXObjectType | string, filtered: boolean = true
    ): Promise<ObjectSearch[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        let attributes = [];
        if (service) {
            attributes = await service.getSortableAttributes(filtered);
        } else {
            const errorMessage = `No service registered for object type ${objectType}`;
            console.warn(errorMessage);
        }
        return attributes;
    }

    public async getSortableAttributes(
        filtered: boolean = true, objectType: KIXObjectType | string = this.objectType
    ): Promise<ObjectSearch[]> {
        const supportedAttributes = await KIXObjectService.loadObjects<ObjectSearch>(
            KIXObjectType.OBJECT_SEARCH, undefined, undefined,
            new ObjectSearchLoadingOptions(objectType), true
        ).catch(() => [] as ObjectSearch[]);
        const sortableAttributes = supportedAttributes.filter((sA) => sA.IsSortable);

        return filtered ? sortableAttributes.filter(
            (sA) =>
                sA.Property !== 'ID' && sA.Property !== 'Valid' &&
                sA.Property !== 'CreateByID' && sA.Property !== 'ChangeByID'
        ) : sortableAttributes;
    }

    public static async getSortOrder(
        property: string, descending: boolean = false, objectType: KIXObjectType | string
    ): Promise<string> {
        let sortOrder = null;
        if (property) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
            if (service) {
                sortOrder = await service.getSortOrder(property, descending, objectType);
            } else {
                const errorMessage = `No service registered for object type ${objectType}`;
                console.warn(errorMessage);
            }
        }

        return sortOrder;
    }

    protected async getSortOrder(
        property: string, descending: boolean, objectType: KIXObjectType | string
    ): Promise<string> {
        property = this.getSortAttribute(property);
        const sortType = await this.getSortType(property, objectType);
        if (property.match(/^DynamicFields\./)) {
            property = property.replace(
                /^DynamicFields\.(.+)$/, 'DynamicField_$1'
            );
        }
        return `${this.objectType}.${descending ? '-' : ''}${property}:${sortType}`;
    }

    protected async getSortType(property: string, objectType: KIXObjectType | string): Promise<BackendSearchDataType> {
        let sortType = BackendSearchDataType.TEXTUAL;
        const supportedAttributes = await KIXObjectService.getSortableAttributes(objectType);
        if (supportedAttributes?.length) {
            const knownTypes = Object.keys(BackendSearchDataType);
            const relevantAttribute = supportedAttributes.find((sA) => sA.Property === property);
            if (relevantAttribute) {
                sortType = relevantAttribute.ValueType as BackendSearchDataType;
                if (!knownTypes.some((t) => t === sortType)) {
                    sortType = BackendSearchDataType.TEXTUAL;
                }
            }
        }
        return sortType;
    }

    public static getSortAttribute(objectType: KIXObjectType | string, attribute: string, dep?: string): string {
        if (attribute) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
            if (service) {
                attribute = service.getSortAttribute(attribute, dep);
            } else {
                const errorMessage = `No service registered for object type ${objectType}`;
                console.warn(errorMessage);
            }
        }

        return attribute;
    }

    public getSortAttribute(attribute: string, dep?: string): string {
        for (const extendedService of this.extendedServices) {
            const extendedAttribute = extendedService.getSortAttribute(attribute, dep);
            if (extendedAttribute) {
                return extendedAttribute;
            }
        }

        switch (attribute) {
            case KIXObjectProperty.VALID_ID:
                return 'Valid';
            default:
        }

        return attribute;
    }

    public static async isBackendSortSupportedForProperty(
        objectType: KIXObjectType | string, property: string, dep?: string
    ): Promise<boolean> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            const supportedAttributes = await service.getSortableAttributes(false);
            if (supportedAttributes?.length) {
                const sortProperty = service.getSortAttribute(property, dep);
                return supportedAttributes.some((sA) => sA.Property === sortProperty);
            }
        }
        return false;
    }

    public static async getFilterableAttributes(
        objectType: KIXObjectType | string, filtered: boolean = true
    ): Promise<ObjectSearch[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        let attributes = [];
        if (service) {
            attributes = await service.getFilterableAttributes(filtered);
        } else {
            const errorMessage = `No service registered for object type ${objectType}`;
            console.warn(errorMessage);
        }
        return attributes;
    }

    public async getFilterableAttributes(
        filtered: boolean = true, objectType: KIXObjectType | string = this.objectType
    ): Promise<ObjectSearch[]> {
        const supportedAttributes = await KIXObjectService.loadObjects<ObjectSearch>(
            KIXObjectType.OBJECT_SEARCH, undefined, undefined,
            new ObjectSearchLoadingOptions(objectType), true
        ).catch(() => [] as ObjectSearch[]);
        return supportedAttributes.filter((sA) => sA.IsSearchable);
    }

    public async getFilterAttributeForFilter(attribute: string, dep?: string): Promise<string> {
        return this.getFilterAttribute(attribute, dep);
    }

    public async getFilterAttribute(attribute: string, dep?: string): Promise<string> {
        for (const extendedService of this.extendedServices) {
            const filterAttribute = extendedService.getFilterAttribute(attribute, dep);
            if (typeof filterAttribute !== 'undefined' && filterAttribute !== null) {
                return filterAttribute;
            }
        }

        switch (attribute) {
            // TODO: currently not supported by some objects
            // case KIXObjectProperty.CREATE_BY:
            //     return KIXObjectProperty.CREATE_BY_ID;
            // case KIXObjectProperty.CHANGE_BY:
            //     return KIXObjectProperty.CHANGE_BY_ID;
            default:
        }
        return attribute;
    }

    public static async getBackendFilterType(
        objectType: KIXObjectType | string, property: string, dep?: string
    ): Promise<BackendSearchDataType | string> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            return service.getBackendFilterType(property, dep);
        }
        return;
    }

    protected async getBackendFilterType(property: string, dep?: string): Promise<BackendSearchDataType | string> {
        for (const extendedService of this.extendedServices) {
            const extendedSupport = extendedService.getBackendFilterType(property, dep);
            if (typeof extendedSupport !== 'undefined' && extendedSupport !== null) {
                return extendedSupport;
            }
        }

        const dfType = await this.getBackendFilterTypeForDF(property, dep);
        if (typeof dfType !== 'undefined' && dfType !== null) {
            return dfType;
        }

        property = await this.getFilterAttribute(property, dep);
        switch (property) {
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CREATE_BY_ID:
            case KIXObjectProperty.CHANGE_BY_ID:
                return 'Autocomplete';
            default:
        }

        const supportedAttributes = await this.getFilterableAttributes(false);
        const attribute = supportedAttributes.find((sa) => sa.Property === property);
        return attribute?.ValueType || BackendSearchDataType.TEXTUAL;
    }

    protected async getBackendFilterTypeForDF(property: string, dep?: string): Promise<BackendSearchDataType | string> {
        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const dynamicField = await KIXObjectService.loadDynamicField(dfName);
            for (const extendedService of this.extendedServices) {
                const extendedSupport = extendedService.getBackendFilterTypeForDF(dynamicField, dep);
                if (typeof extendedSupport !== 'undefined' && extendedSupport !== null) {
                    return extendedSupport;
                }
            }

            switch (dynamicField.FieldType) {
                case DynamicFieldTypes.SELECTION:
                    return BackendSearchDataType.NUMERIC;
                case DynamicFieldTypes.CI_REFERENCE:
                    return 'Autocomplete';
                default:
            }
        }
        return;
    }

    public static async isBackendFilterSupportedForProperty(
        objectType: KIXObjectType | string, property: string, dep?: string, allowDates: boolean = false
    ): Promise<boolean> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            const supportedAttributes = await service.getFilterableAttributes(false);
            if (supportedAttributes?.length) {
                return service.isBackendFilterSupportedForProperty(
                    objectType, property, supportedAttributes, dep, allowDates
                );
            }
        }
        return false;
    }

    protected async isBackendFilterSupportedForProperty(
        objectType: KIXObjectType | string,
        property: string,
        supportedAttributes: ObjectSearch[],
        dep?: string,
        allowDates: boolean = false
    ): Promise<boolean> {
        const filterList = allowDates ? ['ID'] : [
            'ID',

            // TODO: currently date/time is not supported (in FE)
            KIXObjectProperty.CREATE_TIME,
            KIXObjectProperty.CHANGE_TIME
        ];

        // ignore id property
        const constructors = this.getObjectConstructors(objectType);
        if (constructors?.length && constructors[0]) {
            const object = new constructors[0]();
            if (typeof object.getIdPropertyName === 'function') {
                const idProperty = object.getIdPropertyName();
                if (idProperty) {
                    filterList.push(idProperty);
                }
            }
        }

        if (filterList.some((f) => f === property)) {
            return false;
        }

        for (const extendedService of this.extendedServices) {
            const extendedSupport = extendedService.isBackendFilterSupportedForProperty(property, dep);
            if (typeof extendedSupport !== 'undefined' && extendedSupport !== null) {
                return extendedSupport;
            }
        }

        const dfName = KIXObjectService.getDynamicFieldName(property);
        if (dfName) {
            const dfSupport = await this.isBackendFilterSupportedForDF(dfName, allowDates);
            if (typeof dfSupport !== 'undefined' && dfSupport !== null) {
                return dfSupport;
            }
        }

        property = await this.getFilterAttribute(property, dep);
        return supportedAttributes.some((sA) => sA.Property === property);
    }

    public async isBackendFilterSupportedForDF(dfName: string, allowDates: boolean = false): Promise<boolean> {
        const dynamicField = await KIXObjectService.loadDynamicField(dfName);
        for (const extendedService of this.extendedServices) {
            const extendedSupport = extendedService.isBackendFilterSupportedForDF(dynamicField);
            if (typeof extendedSupport !== 'undefined' && extendedSupport !== null) {
                return extendedSupport;
            }
        }
        switch (dynamicField.FieldType) {
            case DynamicFieldTypes.DATE:
            case DynamicFieldTypes.DATE_TIME:
                return allowDates;
            case DynamicFieldTypes.CHECK_LIST:
            case DynamicFieldTypes.TABLE:
            // FIXME: disable or enable DataSource in KIXConnect
            case 'DataSource':
                return false;
            default:
        }
    }


}
