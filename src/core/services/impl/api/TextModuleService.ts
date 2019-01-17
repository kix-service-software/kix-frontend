import { KIXObjectService } from './KIXObjectService';
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, TextModule, Error
} from '../../../model';
import { TextModuleResponse, TextModulesResponse } from '../../../api';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class TextModuleService extends KIXObjectService {

    private static INSTANCE: TextModuleService;

    public static getInstance(): TextModuleService {
        if (!TextModuleService.INSTANCE) {
            TextModuleService.INSTANCE = new TextModuleService();
        }
        return TextModuleService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'textmodules';

    public kixObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.getInstance().registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TEXT_MODULE;
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.TEXT_MODULE:
                objects = await this.getTextModules(token, objectIds, loadingOptions);
                break;
            default:
        }
        return objects;
    }

    private async getTextModules(
        token: string, textModuleIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<TextModule[]> {
        const query = this.prepareQuery(loadingOptions);

        let textModules: TextModule[] = [];

        if (textModuleIds && textModuleIds.length) {
            textModuleIds = textModuleIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri(this.RESOURCE_URI, textModuleIds.join(','));
            const response = await this.getObjectByUri<TextModuleResponse | TextModulesResponse>(
                token, uri, query
            );

            if (textModuleIds.length === 1) {
                textModules = [(response as TextModuleResponse).TextModule];
            } else {
                textModules = (response as TextModulesResponse).TextModule;
            }

        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'TextModule', token, query);
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<TextModulesResponse>(token, uri, query);
            textModules = response.TextModule;
        } else {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<TextModulesResponse>(token, uri, query);
            textModules = response.TextModule;
        }

        return textModules;
    }

    public createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

}
