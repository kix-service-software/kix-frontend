/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { MailFilter } from '../model/MailFilter';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { MailFilterProperty } from '../model/MailFilterProperty';
import { Error } from '../../../../../server/model/Error';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class MailFilterAPIService extends KIXObjectAPIService {

    private static INSTANCE: MailFilterAPIService;

    public static getInstance(): MailFilterAPIService {
        if (!MailFilterAPIService.INSTANCE) {
            MailFilterAPIService.INSTANCE = new MailFilterAPIService();
        }
        return MailFilterAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'system/communication/mailfilters';

    public objectType: KIXObjectType = KIXObjectType.MAIL_FILTER;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.MAIL_FILTER) {
            objectResponse = await super.load<MailFilter>(
                token, KIXObjectType.MAIL_FILTER, this.RESOURCE_URI, loadingOptions, objectIds, 'MailFilter',
                clientRequestId, MailFilter
            );
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        parameter = this.prepareParameter(parameter);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, KIXObjectType.MAIL_FILTER, 'MailFilterID', true
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
        parameter = this.prepareParameter(parameter);
        const uri = this.buildUri(this.RESOURCE_URI, objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.MAIL_FILTER, 'MailFilterID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    private prepareParameter(parameter: Array<[string, any]>): Array<[string, any]> {
        if (!parameter.some((p) => p[0] === MailFilterProperty.STOP_AFTER_MATCH)) {
            parameter.push([MailFilterProperty.STOP_AFTER_MATCH, 0]);
        }
        return parameter;
    }
}
