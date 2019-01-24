import { IKIXObjectService } from "./IKIXObjectService";
import {
    KIXObject, KIXObjectType, FilterCriteria, DataType, TreeNode,
    KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, OverlayType, KIXObjectSpecificDeleteOptions,
    ComponentContent,
    KIXObjectCache,
    Error,
    TableFilterCriteria
} from "../../model";
import { KIXObjectSocketListener } from "./KIXObjectSocketListener";
import { FormService } from "../form";
import { ServiceType } from "./ServiceType";
import { IAutofillConfiguration } from "../components";
import { ServiceRegistry } from "./ServiceRegistry";
import { OverlayService } from "../OverlayService";
import { ServiceMethod } from "./ServiceMethod";

export abstract class KIXObjectService<T extends KIXObject = KIXObject> implements IKIXObjectService<T> {

    public abstract isServiceFor(kixObjectType: KIXObjectType);

    public abstract getLinkObjectName(): string;

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.OBJECT;
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return [[property, value]];
    }

    public static async loadObjects<T extends KIXObject>(
        objectType: KIXObjectType, objectIds?: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions = new KIXObjectLoadingOptions(),
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<T[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        let objects = [];
        if (service) {
            objects = await service.loadObjects(
                objectType, objectIds ? [...objectIds] : null,
                loadingOptions, objectLoadingOptions, cache
            ).catch((error: Error) => {
                const content = new ComponentContent('list-with-title',
                    {
                        title: `Fehler beim Laden (${objectType}):`,
                        list: [`${error.Code}: ${error.Message}`]
                    }
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, '', true
                );
                return [];
            });
        } else {
            const errorMessage = `No service registered for object type ${objectType}`;
            console.error(errorMessage);
        }
        return objects;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {
        let objects = [];
        if (cache) {
            if (objectIds) {
                const ids = [...objectIds];
                objects = [...KIXObjectCache.getCachedObjects(objectType, ids)];
                const idsToLoad = KIXObjectCache.getIdsToLoad(objectType, ids);

                if (idsToLoad.length) {
                    const loadedObjects = await KIXObjectSocketListener.getInstance().loadObjects<T>(
                        objectType, idsToLoad, loadingOptions, objectLoadingOptions
                    );

                    loadedObjects.forEach((o) => KIXObjectCache.addObject(objectType, o));
                    objects = KIXObjectCache.getCachedObjects(objectType, ids);
                }
            } else {
                if (KIXObjectCache.hasObjectCache(objectType)) {
                    objects = KIXObjectCache.getObjectCache(objectType);
                } else {
                    objects = await KIXObjectSocketListener.getInstance().loadObjects<T>(
                        objectType, objectIds, loadingOptions, objectLoadingOptions
                    );
                    objects.forEach((o) => KIXObjectCache.addObject(objectType, o));
                }
            }
        } else {
            objects = await KIXObjectSocketListener.getInstance().loadObjects<T>(
                objectType, objectIds, loadingOptions, objectLoadingOptions
            );
        }

        return objects;
    }

    public static async createObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        KIXObjectCache.updateCache(objectType, null, ServiceMethod.CREATE, parameter, createOptions);
        const objectId = await KIXObjectSocketListener.getInstance().createObject(objectType, parameter, createOptions)
            .catch((error: Error) => {
                const content = new ComponentContent('list-with-title',
                    {
                        title: `Fehler beim Erstellen (${objectType}):`,
                        list: [`${error.Code}: ${error.Message}`]
                    }
                );
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, content, 'Fehler!', true
                );
                return null;
            });
        return objectId;
    }

    public async createObject(
        objectType: KIXObjectType, object: KIXObject, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        const parameter = this.prepareCreateParameter(object);
        const objectId = await KIXObjectSocketListener.getInstance().createObject(objectType, parameter, createOptions);
        KIXObjectCache.updateCache(objectType, objectId, ServiceMethod.CREATE, parameter, createOptions);
        return objectId;
    }

    public static async createObjectByForm(
        objectType: KIXObjectType, formId: string, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return await service.createObjectByForm(objectType, formId, createOptions);
    }

    public async createObjectByForm(
        objectType: KIXObjectType, formId: string, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId);
        KIXObjectCache.updateCache(objectType, null, ServiceMethod.CREATE, parameter, createOptions);

        const objectId = await KIXObjectSocketListener.getInstance().createObject(objectType, parameter, createOptions);
        return objectId;
    }

    public static async updateObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);

        KIXObjectCache.updateCache(objectType, objectId, ServiceMethod.UPDATE, parameter);

        const updatedObjectId = await service.updateObject(objectType, parameter, objectId).catch((error: Error) => {
            const content = new ComponentContent('list-with-title',
                {
                    title: `Fehler beim Aktualisieren (${objectType}):`,
                    list: [`${error.Code}: ${error.Message}`]
                }
            );
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, content, 'Fehler!', true
            );
            throw error;
        });
        return updatedObjectId;
    }

    public async updateObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updatedObjectId = await KIXObjectSocketListener.getInstance().updateObject(
            objectType, parameter, objectId
        ).catch((error: Error) => {
            const content = new ComponentContent('list-with-title',
                {
                    title: `Fehler beim Aktualisieren (${objectType}):`,
                    list: [`${error.Code}: ${error.Message}`]
                }
            );
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, content, 'Fehler!', true
            );
            throw error;
        });

        KIXObjectCache.updateCache(objectType, objectId, ServiceMethod.UPDATE);

        return updatedObjectId;
    }

    public static async updateObjectByForm(
        objectType: KIXObjectType, formId: string, objectId: number | string
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return await service.updateObjectByForm(objectType, formId, objectId);
    }

    public async updateObjectByForm(
        objectType: KIXObjectType, formId: string, objectId: number | string
    ): Promise<string | number> {
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId, true);

        KIXObjectCache.updateCache(objectType, objectId, ServiceMethod.UPDATE, parameter);

        const updatedObjectId = await KIXObjectSocketListener.getInstance().updateObject(
            objectType, parameter, objectId
        );
        return updatedObjectId;
    }

    public static async deleteObject(
        objectType: KIXObjectType, objectIds: Array<number | string>, deleteOptions?: KIXObjectSpecificDeleteOptions
    ): Promise<Array<number | string>> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        const errors: string[] = [];
        const failIds: Array<number | string> = [];
        for (const objectId of objectIds) {
            KIXObjectCache.updateCache(objectType, objectId, ServiceMethod.DELETE);
            await service.deleteObject(objectType, objectId, deleteOptions).catch((error: Error) => {
                errors.push(`${error.Code}: ${error.Message}`);
                failIds.push(objectId);
            });
        }
        if (!!errors.length) {
            const content = new ComponentContent('list-with-title',
                {
                    title: `Fehler beim Löschen (${objectType}):`,
                    list: errors
                }
            );
            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING, null, content, 'Fehler!', true
            );
        }
        return failIds;
    }

    public async deleteObject(
        objectType: KIXObjectType, objectId: string | number, deleteOptions: KIXObjectSpecificDeleteOptions
    ): Promise<void> {
        await KIXObjectSocketListener.getInstance().deleteObject(objectType, objectId, deleteOptions);
    }

    public async prepareFormFields(formId: string, forUpdate: boolean = false): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];

        const predefinedParameterValues = await this.preparePredefinedValues(forUpdate);
        if (predefinedParameterValues) {
            predefinedParameterValues.forEach((pv) => parameter.push([pv[0], pv[1]]));
        }

        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const formValues = formInstance.getAllFormFieldValues();
        const iterator = formValues.keys();
        let key = iterator.next();
        while (key.value) {
            const formFieldInstanceId = key.value;
            const field = await formInstance.getFormField(formFieldInstanceId);
            const property = field ? field.property : null;
            const value = formValues.get(formFieldInstanceId);

            if (value && typeof value.value !== 'undefined' && property) {
                let preparedValue;
                if (forUpdate) {
                    preparedValue = await this.prepareUpdateValue(property, value.value);
                } else {
                    preparedValue = await this.prepareCreateValue(property, value.value);
                }
                if (preparedValue) {
                    preparedValue.forEach((pv) => parameter.push([pv[0], pv[1]]));
                }
            }

            key = iterator.next();
        }

        return parameter;
    }

    protected async prepareUpdateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return await this.prepareCreateValue(property, value);
    }

    protected async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return [];
    }

    protected prepareCreateParameter(object: KIXObject): Array<[string, any]> {
        const parameter: Array<[string, any]> = [];
        for (const key in object) {
            if (object[key]) {
                parameter.push([key, object[key]]);
            }
        }
        return parameter;
    }

    public prepareFullTextFilter(searchValue: string): FilterCriteria[] {
        return [];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return [];
    }

    public static checkFilterValue(
        objectType: KIXObjectType, object: KIXObject, criteria: TableFilterCriteria
    ): boolean {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return service ? service.checkFilterValue(object, criteria) : true;
    }

    public checkFilterValue(object: T, criteria: TableFilterCriteria): boolean {
        return true;
    }

    public determineDependendObjects(sourceObjects: T[], targetObjectType: KIXObjectType): string[] | number[] {
        return [];
    }

    public getAutoFillConfiguration(textMatch: any, placeholder: string): IAutofillConfiguration {
        return null;
    }

    protected getLinkedObjectIds(kixObjects: KIXObject[], linkedObjectType: KIXObjectType): string[] | number[] {
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

}
