/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { Error } from '../../../../../server/model/Error';
import { TextModule } from '../model/TextModule';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class TextModuleAPIService extends KIXObjectAPIService {

    private static INSTANCE: TextModuleAPIService;

    public static getInstance(): TextModuleAPIService {
        if (!TextModuleAPIService.INSTANCE) {
            TextModuleAPIService.INSTANCE = new TextModuleAPIService();
        }
        return TextModuleAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'textmodules');

    public objectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TEXT_MODULE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {
        let objectResponse = new ObjectResponse();

        switch (objectType) {
            case KIXObjectType.TEXT_MODULE:
                objectResponse = await super.load<TextModule>(
                    token, KIXObjectType.TEXT_MODULE, this.RESOURCE_URI, loadingOptions, objectIds,
                    KIXObjectType.TEXT_MODULE, clientRequestId, TextModule
                );
                break;
            default:
        }
        return objectResponse as ObjectResponse<T>;
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {
        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, KIXObjectType.TEXT_MODULE, 'TextModuleID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.TEXT_MODULE, 'TextModuleID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

}
