import { KIXObjectService } from './KIXObjectService';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, SysConfigItem
} from '../../../model';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { SysConfigItemFactory } from '../../object-factories/SysConfigItemFactory';

export class SysConfigService extends KIXObjectService {

    private static INSTANCE: SysConfigService;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }
        return SysConfigService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'config');

    public objectType: KIXObjectType = KIXObjectType.SYS_CONFIG_ITEM;

    private constructor() {
        super([new SysConfigItemFactory()]);
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

        if (objectType === KIXObjectType.SYS_CONFIG_ITEM) {
            objects = await super.load<SysConfigItem>(
                token, KIXObjectType.SYS_CONFIG_ITEM, this.RESOURCE_URI, loadingOptions, objectIds, 'SysConfigItem'
            );
        }

        return objects;
    }

}
