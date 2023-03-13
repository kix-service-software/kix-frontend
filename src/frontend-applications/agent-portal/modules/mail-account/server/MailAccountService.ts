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
import { MailAccount } from '../model/MailAccount';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { MailAccountProperty } from '../model/MailAccountProperty';
import { DispatchingType } from '../model/DispatchingType';
import { Error } from '../../../../../server/model/Error';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class MailAccountService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = this.buildUri('system', 'communication', 'mailaccounts');

    private static INSTANCE: MailAccountService;

    public static getInstance(): MailAccountService {
        if (!MailAccountService.INSTANCE) {
            MailAccountService.INSTANCE = new MailAccountService();
        }
        return MailAccountService.INSTANCE;
    }

    public objectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.MAIL_ACCOUNT_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.MAIL_ACCOUNT) {
            const uri = this.buildUri('system', 'communication', 'mailaccounts');
            objectResponse = await super.load<MailAccount>(
                token, KIXObjectType.MAIL_ACCOUNT, uri, loadingOptions, objectIds, 'MailAccount',
                clientRequestId, MailAccount
            );
        } else if (objectType === KIXObjectType.MAIL_ACCOUNT_TYPE) {
            const uri = this.buildUri('system', 'communication', 'mailaccounts', 'types');
            objectResponse = await super.load<string>(
                token, KIXObjectType.MAIL_ACCOUNT_TYPE, uri, null, null, 'MailAccountType', clientRequestId
            );
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        parameter = this.prepareParameter(parameter);

        const uri = this.buildUri('system', 'communication', 'mailaccounts');
        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.MAIL_ACCOUNT, 'MailAccountID', true
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
        const fetch = this.getParameterValue(parameter, MailAccountProperty.EXEC_FETCH);
        if (!fetch) {
            parameter = this.prepareParameter(parameter);
        }
        const uri = this.buildUri('system', 'communication', 'mailaccounts', objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.MAIL_ACCOUNT, 'MailAccountID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    private prepareParameter(parameter: Array<[string, any]>): Array<[string, any]> {
        const dispatchingIndex = parameter.findIndex((p) => p[0] === MailAccountProperty.DISPATCHING_BY);
        if (dispatchingIndex !== -1) {
            if (parameter[dispatchingIndex][1] === DispatchingType.FRONTEND_KEY_DEFAULT) {
                parameter[dispatchingIndex][1] = DispatchingType.BACKEND_KEY_DEFAULT;
            } else {
                if (!parameter.some((p) => p[0] === MailAccountProperty.QUEUE_ID)) {
                    parameter.push([MailAccountProperty.QUEUE_ID, parameter[dispatchingIndex][1]]);
                }
                parameter[dispatchingIndex][1] = DispatchingType.BACKEND_KEY_QUEUE;
            }
        }
        if (!parameter.some((p) => p[0] === MailAccountProperty.TRUSTED)) {
            parameter.push([MailAccountProperty.TRUSTED, 0]);
        }
        const password = this.getParameterValue(parameter, MailAccountProperty.PASSWORD);
        if (!password || password === '') {
            parameter = parameter.filter((p) => p[0] !== MailAccountProperty.PASSWORD);
        }
        return parameter;
    }
}
