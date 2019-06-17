import { KIXObjectService } from './KIXObjectService';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, SysConfigOption,
    Error, SysConfigOptionFactory, SysConfigOptionDefinition, SysConfigOptionDefinitionFactory
} from '../../../model';
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
    protected SUB_RESSOURCE_URI: string = "definitions";

    public objectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION;

    private constructor() {
        super([new SysConfigOptionFactory(), new SysConfigOptionDefinitionFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION
            || kixObjectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public async loadObjects<O>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects = [];

        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            objects = await super.load<SysConfigOption>(
                token, KIXObjectType.SYS_CONFIG_OPTION, this.RESOURCE_URI, loadingOptions, objectIds, 'SysConfigOption'
            );
        } else if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, this.SUB_RESSOURCE_URI);
            objects = await super.load<SysConfigOptionDefinition>(
                token, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, uri,
                loadingOptions, objectIds, 'SysConfigOptionDefinition'
            );
        }

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
