/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { IKIXObjectFormService } from './IKIXObjectFormService';
import { KIXObjectSpecificDeleteOptions } from '../../../../model/KIXObjectSpecificDeleteOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { TreeNode } from './tree';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { User } from '../../../user/model/User';
import { ValidObject } from '../../../valid/model/ValidObject';
import { TableFilterCriteria } from '../../../../model/TableFilterCriteria';
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
import { SortUtil } from '../../../../model/SortUtil';
import { DataType } from '../../../../model/DataType';
import { ExtendedKIXObjectService } from './ExtendedKIXObjectService';

export abstract class KIXObjectService<T extends KIXObject = KIXObject> implements IKIXObjectService<T> {

    private extendedServices: ExtendedKIXObjectService[] = [];

    public addExtendedService(service: ExtendedKIXObjectService): void {
        this.extendedServices.push(service);
    }

    public abstract isServiceFor(kixObjectType: KIXObjectType | string): boolean;

    public getLinkObjectName(): string {
        return null;
    }

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.OBJECT;
    }

    public static async loadObjects<T extends KIXObject>(
        objectType: KIXObjectType | string, objectIds?: Array<number | string>,
        loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions, silent: boolean = false,
        cache: boolean = true, forceIds: boolean = false
    ): Promise<T[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        let objects = [];
        if (service) {
            objects = await service.loadObjects(
                objectType, objectIds ? [...objectIds] : null, loadingOptions, objectLoadingOptions, cache, forceIds
            ).catch((error: Error) => {
                if (!silent) {
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
        cache: boolean = true, forceIds?: boolean
    ): Promise<O[]> {
        let objects = [];
        if (objectIds) {
            if (objectIds.length) {
                const loadedObjects = await KIXObjectSocketClient.getInstance().loadObjects<T>(
                    objectType, objectIds, loadingOptions, objectLoadingOptions, cache
                );
                objects = loadedObjects;
            }
        } else {
            objects = await KIXObjectSocketClient.getInstance().loadObjects<T>(
                objectType, objectIds, loadingOptions, objectLoadingOptions, cache
            );
        }

        return objects;
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
                        title: `Translatable#Error on create:`,
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
        const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(objectType, ServiceType.FORM);
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
        const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(objectType, ServiceType.FORM);
        const parameter: Array<[string, any]> = await service.prepareFormFields(formId, false, createOptions);
        const objectId = await KIXObjectSocketClient.getInstance().createObject(
            objectType, parameter, createOptions, cacheKeyPrefix
        );
        return objectId;
    }

    public static async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>, objectId: number | string,
        catchError: boolean = true, cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);

        const updatedObjectId = await service.updateObject(objectType, parameter, objectId, cacheKeyPrefix)
            .catch((error: Error) => {
                if (catchError) {
                    // TODO: Publish event to show an error dialog
                    const content = new ComponentContent('list-with-title',
                        {
                            title: `Translatable#Error on update:`,
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
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const updatedObjectId = await KIXObjectSocketClient.getInstance().updateObject(
            objectType, parameter, objectId, null, cacheKeyPrefix
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
        const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(objectType, ServiceType.FORM);
        const parameter: Array<[string, any]> = await service.prepareFormFields(formId, true);

        const updatedObjectId = await KIXObjectSocketClient.getInstance().updateObject(
            objectType, parameter, objectId, cacheKeyPrefix
        );
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
        if (!!errors.length) {
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
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<TreeNode[]> {
        for (const extendedService of this.extendedServices) {
            const extendedNodes = await extendedService.getTreeNodes(
                property, showInvalid, invalidClickable, filterIds, loadingOptions, objectLoadingOptions
            );
            if (extendedNodes) {
                return extendedNodes;
            }
        }

        let nodes: TreeNode[] = [];

        switch (property) {
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                let users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, null,
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
        objectType: KIXObjectType | string, object: KIXObject, criteria: TableFilterCriteria
    ): Promise<boolean> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return service ? await service.checkFilterValue(object, criteria) : true;
    }

    public async checkFilterValue(object: T, criteria: TableFilterCriteria): Promise<boolean> {
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
        objects: KIXObject[], showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        if (objects && !!objects.length) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objects[0].KIXObjectType);
            nodes = await service.prepareObjectTree(objects, showInvalid, invalidClickable, filterIds);
        }
        return nodes;
    }

    public async prepareObjectTree(
        objects: KIXObject[], showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (objects && !!objects.length) {
            for (const o of objects) {
                nodes.push(new TreeNode(o.ObjectId, await LabelService.getInstance().getObjectText(o)));
            }
        }
        return nodes;
    }
    public static async search(
        objectType: KIXObjectType | string, searchValue: string, limit: number = 10,
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
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
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

    public static async loadDynamicField(name: string, id?: number): Promise<DynamicField> {
        let dynamicFields: DynamicField[];
        if (name || id) {
            const filter = id ? null : [
                new FilterCriteria(
                    DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, name
                )
            ];
            dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, id ? [id] : null,
                new KIXObjectLoadingOptions(
                    filter, null, null, [DynamicFieldProperty.CONFIG]
                ), null, true
            ).catch(() => [] as DynamicField[]);
        }
        return dynamicFields && dynamicFields.length ? dynamicFields[0] : null;
    }

    public static getDynamicFieldName(property: string): string {
        let name: string;
        if (property && KIXObjectService.isDynamicFieldProperty(property)) {
            name = property.replace(/^DynamicFields?\.(.+)/, '$1');
        }
        return name;
    }

    public static isDynamicFieldProperty(property: string): boolean {
        return Boolean(property.match(/^DynamicFields?\..+/));
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

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, KIXObjectType.TICKET
            )
        ]);
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions, null, true
        ).catch(() => [] as DynamicField[]);

        const dfEvents = dynamicFields ? dynamicFields.map((d) => `TicketDynamicFieldUpdate_${d.Name}`) : [];

        // TODO: there is currently only one article df event
        dfEvents.push('ArticleDynamicFieldUpdate');

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
                ...dfEvents.map((event: string) => {
                    return new TreeNode(event, event);
                })
            ];
        }
        return SortUtil.sortObjects(nodes, 'label', DataType.STRING);
    }
}
