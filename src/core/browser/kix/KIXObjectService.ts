import { IKIXObjectService } from "./IKIXObjectService";
import {
    KIXObject, KIXObjectType, FilterCriteria, TreeNode,
    KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, OverlayType, KIXObjectSpecificDeleteOptions,
    ComponentContent, Error, TableFilterCriteria
} from "../../model";
import { KIXObjectSocketClient } from "./KIXObjectSocketClient";
import { FormService } from "../form";
import { ServiceType } from "./ServiceType";
import { IAutofillConfiguration } from "../components";
import { ServiceRegistry } from "./ServiceRegistry";
import { OverlayService } from "../OverlayService";

export abstract class KIXObjectService<T extends KIXObject = KIXObject> implements IKIXObjectService<T> {

    public abstract isServiceFor(kixObjectType: KIXObjectType): boolean;

    public abstract getLinkObjectName(): string;

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return kixObjectServiceType === ServiceType.OBJECT;
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return [[property, value]];
    }

    public static async loadObjects<T extends KIXObject>(
        objectType: KIXObjectType, objectIds?: Array<number | string>,
        loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions, silent: boolean = false
    ): Promise<T[]> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        let objects = [];
        if (service) {
            objects = await service.loadObjects(
                objectType, objectIds ? [...objectIds] : null, loadingOptions, objectLoadingOptions
            ).catch((error: Error) => {
                if (!silent) {
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
            console.error(errorMessage);
        }
        return objects;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects = [];
        if (objectIds) {
            if (objectIds.length) {
                const loadedObjects = await KIXObjectSocketClient.getInstance().loadObjects<T>(
                    objectType, objectIds, loadingOptions, objectLoadingOptions
                );
                objects = loadedObjects;
            }
        } else {
            objects = await KIXObjectSocketClient.getInstance().loadObjects<T>(
                objectType, objectIds, loadingOptions, objectLoadingOptions
            );
        }

        return objects;
    }

    public static async createObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        catchError: boolean = true, cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const objectId = await KIXObjectSocketClient.getInstance().createObject(
            objectType, parameter, createOptions, cacheKeyPrefix
        ).catch(async (error: Error) => {
            if (catchError) {
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
        objectType: KIXObjectType, object: KIXObject, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const parameter = this.prepareCreateParameter(object);
        const objectId = await KIXObjectSocketClient.getInstance().createObject(
            objectType, parameter, createOptions, cacheKeyPrefix
        );
        return objectId;
    }

    public static async createObjectByForm(
        objectType: KIXObjectType, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return await service.createObjectByForm(objectType, formId, createOptions, cacheKeyPrefix);
    }

    public async createObjectByForm(
        objectType: KIXObjectType, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId);
        const objectId = await KIXObjectSocketClient.getInstance().createObject(
            objectType, parameter, createOptions, cacheKeyPrefix
        );
        return objectId;
    }

    public static async updateObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string,
        catchError: boolean = true, cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);

        const updatedObjectId = await service.updateObject(objectType, parameter, objectId, cacheKeyPrefix)
            .catch((error: Error) => {
                if (catchError) {
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
        objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const updatedObjectId = await KIXObjectSocketClient.getInstance().updateObject(
            objectType, parameter, objectId, null, cacheKeyPrefix
        );

        return updatedObjectId;
    }

    public static async updateObjectByForm(
        objectType: KIXObjectType, formId: string, objectId: number | string, cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectService>(objectType);
        return await service.updateObjectByForm(objectType, formId, objectId, cacheKeyPrefix);
    }

    public async updateObjectByForm(
        objectType: KIXObjectType, formId: string, objectId: number | string, cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId, true);

        const updatedObjectId = await KIXObjectSocketClient.getInstance().updateObject(
            objectType, parameter, objectId, cacheKeyPrefix
        );
        return updatedObjectId;
    }

    public static async deleteObject(
        objectType: KIXObjectType, objectIds: Array<number | string>, deleteOptions?: KIXObjectSpecificDeleteOptions,
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
        objectType: KIXObjectType, objectId: string | number, deleteOptions: KIXObjectSpecificDeleteOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<void> {
        await KIXObjectSocketClient.getInstance().deleteObject(objectType, objectId, deleteOptions, cacheKeyPrefix);
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
