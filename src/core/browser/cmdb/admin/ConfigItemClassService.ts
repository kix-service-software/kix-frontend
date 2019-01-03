import { KIXObjectService } from "../../kix";
import {
    KIXObjectType, KIXObjectLoadingOptions, ConfigItemClass,
    KIXObject, KIXObjectCache, KIXObjectSpecificLoadingOptions
} from "../../../model";

export class ConfigItemClassService extends KIXObjectService<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassService = null;

    public static getInstance(): ConfigItemClassService {
        if (!ConfigItemClassService.INSTANCE) {
            ConfigItemClassService.INSTANCE = new ConfigItemClassService();
        }

        return ConfigItemClassService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    public getLinkObjectName(): string {
        return 'ConfigItemClass';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (objectType === KIXObjectType.CONFIG_ITEM_CLASS) {
            if (!KIXObjectCache.hasObjectCache(objectType)) {
                const objects = await super.loadObjects(
                    objectType, null, loadingOptions, objectLoadingOptions, cache
                );
                objects.forEach((q) => KIXObjectCache.addObject(objectType, q));
            }

            if (!objectIds) {
                return KIXObjectCache.getObjectCache(objectType);
            }
        }

        return await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions, cache);
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        parameter.push([property, value]);
        return parameter;
    }

}
