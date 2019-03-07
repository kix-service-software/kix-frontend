import { KIXObjectService } from "../kix";
import {
    SysConfigItem, KIXObjectType, KIXObject, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, KIXObjectCache
} from "../../model";

export class SysConfigService extends KIXObjectService<SysConfigItem> {

    private static INSTANCE: SysConfigService = null;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }

        return SysConfigService.INSTANCE;
    }

    public async init(): Promise<void> {
        await this.loadObjects(KIXObjectType.SYS_CONFIG_ITEM, null);
    }

    public async loadObjects<O extends KIXObject>(
        kixObjectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (kixObjectType === KIXObjectType.SYS_CONFIG_ITEM) {
            if (!KIXObjectCache.hasObjectCache(kixObjectType)) {
                const objects = await super.loadObjects(
                    kixObjectType, null, loadingOptions, objectLoadingOptions, cache
                );
                objects.forEach((o) => KIXObjectCache.addObject(kixObjectType, o));
            }

            if (!objectIds) {
                return KIXObjectCache.getObjectCache(kixObjectType);
            }
        }

        return await super.loadObjects<O>(kixObjectType, objectIds, loadingOptions, objectLoadingOptions, cache);
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.SYS_CONFIG_ITEM;
    }

    public getLinkObjectName(): string {
        return 'Sysconfig';
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return [];
    }
}
