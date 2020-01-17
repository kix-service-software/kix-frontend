/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ServiceType } from "./ServiceType";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../../../model/KIXObjectSpecificLoadingOptions";
import { ServiceRegistry } from "./ServiceRegistry";
import { ComponentContent } from "./ComponentContent";
import { OverlayService } from "./OverlayService";
import { OverlayType } from "./OverlayType";
import { KIXObjectSocketClient } from "./KIXObjectSocketClient";
import { KIXObjectSpecificCreateOptions } from "../../../../model/KIXObjectSpecificCreateOptions";
import { IKIXObjectFormService } from "./IKIXObjectFormService";
import { KIXObjectSpecificDeleteOptions } from "../../../../model/KIXObjectSpecificDeleteOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { TreeNode } from "./tree";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { User } from "../../../user/model/User";
import { ValidObject } from "../../../valid/model/ValidObject";
import { TableFilterCriteria } from "../../../../model/TableFilterCriteria";
import { IAutofillConfiguration } from "./IAutofillConfiguration";
import { AuthenticationSocketClient } from "./AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../server/model/rest/CRUD";
import { LabelService } from "./LabelService";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { IKIXObjectService } from "./IKIXObjectService";
import { Error } from "../../../../../../server/model/Error";
import { DynamicFieldProperty } from "../../../dynamic-fields/model/DynamicFieldProperty";
import { DynamicField } from "../../../dynamic-fields/model/DynamicField";

export abstract class KIXObjectService<T extends KIXObject = KIXObject> implements IKIXObjectService<T> {

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
        cache: boolean = true
    ): Promise<T[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        let objects = [];
        if (service) {
            objects = await service.loadObjects(
                objectType, objectIds ? [...objectIds] : null, loadingOptions, objectLoadingOptions, cache
            ).catch((error: Error) => {
                if (!silent) {
                    // FIXME: Publish event to show an error dialog
                    const content = new ComponentContent('list-with-title',
                        {
                            title: `Error load object (${objectType}):`,
                            list: [`${error.Code}: ${error.Message}`]
                        }
                    );
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, '', true
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
        cache: boolean = true
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
                // FIXME: Publish event to show an error dialog
                const content = new ComponentContent('list-with-title',
                    {
                        title: `Error while creating ${objectType}`,
                        list: [`${error.Code}: ${error.Message}`]
                    }
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, 'Translatable#Error!', true
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

    public static async createObjectByForm(
        objectType: KIXObjectType | string, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return await service.createObjectByForm(objectType, formId, createOptions, cacheKeyPrefix);
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
                    // FIXME: Publish event to show an error dialog
                    const content = new ComponentContent('list-with-title',
                        {
                            title: `Fehler beim Aktualisieren (${objectType}):`,
                            list: [`${error.Code}: ${error.Message}`]
                        }
                    );
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, 'Translatable#Error!', true
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

    public static async updateObjectByForm(
        objectType: KIXObjectType | string, formId: string, objectId: number | string,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return await service.updateObjectByForm(objectType, formId, objectId, cacheKeyPrefix);
    }

    public async updateObjectByForm(
        objectType: KIXObjectType | string, formId: string, objectId: number | string,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
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
            // FIXME: Publish event to show an error dialog
            const content = new ComponentContent('list-with-title',
                {
                    title: `Fehler beim Löschen (${objectType}):`,
                    list: errors
                }
            );
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, content, 'Translatable#Error!', true
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
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        switch (property) {
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, null, null, null, true
                ).catch((error) => [] as User[]);
                users.forEach((u) => nodes.push(new TreeNode(u.UserID, u.UserFullname, 'kix-icon-man')));
                break;
            case KIXObjectProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                nodes = validObjects.map((vo) => new TreeNode(Number(vo.ID), vo.Name));
                break;
            default:
                const dFRegEx = new RegExp(KIXObjectProperty.DYNAMIC_FIELDS + '?\.(.+)');
                if (property.match(dFRegEx)) {
                    const dfName = property.replace(dFRegEx, '$1');
                    if (dfName) {
                        nodes = await this.getNodesForDF(dfName);
                    }
                }
        }
        return nodes;
    }

    private async getNodesForDF(name: string): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        const field = await this.loadDynamicField(name);
        if (field && field.FieldType === 'Multiselect' && field.Config && field.Config.PossibleValues) {
            for (const pv in field.Config.PossibleValues) {
                if (field.Config.PossibleValues[pv]) {
                    const value = field.Config.PossibleValues[pv];
                    const node = new TreeNode(pv, value);
                    nodes.push(node);
                }
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
                nodes.push(new TreeNode(o.ObjectId, await LabelService.getInstance().getText(o)));
            }
        }
        return nodes;
    }
    public static async search(
        objectType: KIXObjectType | string, searchValue: string, limit: number = 10, validObjects: boolean = true
    ): Promise<KIXObject[]> {
        let result = [];
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        if (service) {
            const filter = await service.prepareFullTextFilter(searchValue);
            if (validObjects) {
                filter.push(new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
                ));
            }
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
            result = await service.loadObjects(objectType, null, loadingOptions);
        }
        return result;
    }

    public static async prepareTree(objects: KIXObject[]): Promise<TreeNode[]> {
        const nodes = [];

        for (const o of objects) {
            const icon = await LabelService.getInstance().getObjectIcon(o);
            const text = await LabelService.getInstance().getText(o);
            nodes.push(new TreeNode(o.ObjectId, text, icon));
        }

        return nodes;
    }

    private async loadDynamicField(name: string): Promise<DynamicField> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    DynamicFieldProperty.NAME, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, name
                )
            ], null, null, [DynamicFieldProperty.CONFIG]
        );
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions, null, true
        );

        return dynamicFields && dynamicFields.length ? dynamicFields[0] : null;
    }

}
