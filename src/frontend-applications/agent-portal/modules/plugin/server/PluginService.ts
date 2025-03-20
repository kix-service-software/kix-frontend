/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { Error } from '../../../../../server/model/Error';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { Plugin } from '../model/Plugin';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class PluginAPIService extends KIXObjectAPIService {

    private static INSTANCE: PluginAPIService;

    protected enableSearchQuery: boolean = false;

    public static getInstance(): PluginAPIService {
        if (!PluginAPIService.INSTANCE) {
            PluginAPIService.INSTANCE = new PluginAPIService();
        }
        return PluginAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'plugins');

    public objectType: KIXObjectType = KIXObjectType.PLUGIN;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.PLUGIN;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: string[], loadingOptions: KIXObjectLoadingOptions,
        objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();

        objectResponse = await super.load(
            token, KIXObjectType.PLUGIN, this.RESOURCE_URI, loadingOptions, objectIds,
            KIXObjectType.PLUGIN, clientRequestId, Plugin, false
        );

        return objectResponse as ObjectResponse<T>;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {

        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest<string>(
            token, clientRequestId, parameter, uri, this.objectType, 'Product'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }
}
