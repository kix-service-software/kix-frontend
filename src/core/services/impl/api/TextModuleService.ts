import { KIXObjectService } from './KIXObjectService';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, TextModule, Error
} from '../../../model';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { TextModuleFactory } from '../../object-factories/TextModuleFactory';

export class TextModuleService extends KIXObjectService {

    private static INSTANCE: TextModuleService;

    public static getInstance(): TextModuleService {
        if (!TextModuleService.INSTANCE) {
            TextModuleService.INSTANCE = new TextModuleService();
        }
        return TextModuleService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'textmodules';

    public objectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    private constructor() {
        super([new TextModuleFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TEXT_MODULE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.TEXT_MODULE:
                objects = await super.load<TextModule>(
                    token, KIXObjectType.TEXT_MODULE, this.RESOURCE_URI, loadingOptions, objectIds, 'TextModule');
                break;
            default:
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
