import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error, MailAccount, MailAccountProperty, DispatchingType
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import { MailAccountFactory } from '../../object-factories/MailAccountFactory';

export class MailAccountService extends KIXObjectService {

    private static INSTANCE: MailAccountService;

    public static getInstance(): MailAccountService {
        if (!MailAccountService.INSTANCE) {
            MailAccountService.INSTANCE = new MailAccountService();
        }
        return MailAccountService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'mailaccounts';
    protected SUB_RESOURCE_URI: string = 'types';

    public objectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT;

    private constructor() {
        super([new MailAccountFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.MAIL_ACCOUNT_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.MAIL_ACCOUNT) {
            objects = await super.load<MailAccount>(
                token, KIXObjectType.MAIL_ACCOUNT, this.RESOURCE_URI, loadingOptions, objectIds, 'MailAccount'
            );
        } else if (objectType === KIXObjectType.MAIL_ACCOUNT_TYPE) {
            const uri = this.buildUri(this.RESOURCE_URI, this.SUB_RESOURCE_URI);
            objects = await super.load<string>(
                token, KIXObjectType.MAIL_ACCOUNT_TYPE, uri, null, null, 'MailAccountType'
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        parameter = this.prepareParameter(parameter);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, KIXObjectType.MAIL_ACCOUNT, 'MailAccountID', true
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
