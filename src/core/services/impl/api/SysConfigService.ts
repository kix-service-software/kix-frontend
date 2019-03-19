import { KIXObjectService } from './KIXObjectService';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, SysConfigItem, Error
} from '../../../model';
import { SysConfigItemsResponse, SysConfigItemResponse } from '../../../api';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class SysConfigService extends KIXObjectService {

    private static INSTANCE: SysConfigService;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }
        return SysConfigService.INSTANCE;
    }

    protected RESOURCE_URI: string = "sysconfig";

    public objectType: KIXObjectType = KIXObjectType.SYS_CONFIG_ITEM;

    private sysconfigCache: SysConfigItem[] = [];

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYS_CONFIG_ITEM;
    }

    public async loadObjects<O>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects = [];

        if (objectType === KIXObjectType.SYS_CONFIG_ITEM && objectIds) {
            const ids = [...objectIds];
            for (const objectId of ids) {
                const index = this.sysconfigCache.findIndex((sci) => sci.ID === objectId);
                if (index !== -1) {
                    objects.push(this.sysconfigCache[index]);

                    const idx = objectIds.findIndex((oid) => oid === objectId);
                    objectIds.splice(idx, 1);
                }
            }

            if (objectIds.length > 1) {
                const uri = this.buildUri(this.RESOURCE_URI, objectIds.join(','));
                const response = await this.getObjectByUri<SysConfigItemsResponse>(
                    token, uri
                );
                objects = [...objects, ...response.SysConfigItem];
            } else if (objectIds.length === 1) {
                const uri = this.buildUri(this.RESOURCE_URI, objectIds[0]);
                const response = await this.getObjectByUri<SysConfigItemResponse>(
                    token, uri
                );
                objects = [...objects, response.SysConfigItem];
            }
        }

        objects = objects.map((sci) => new SysConfigItem(sci));

        return objects;
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

}
