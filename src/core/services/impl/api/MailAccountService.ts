import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error, MailAccount, MailAccountFactory
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';

export class MailAccountService extends KIXObjectService {

    private static INSTANCE: MailAccountService;

    public static getInstance(): MailAccountService {
        if (!MailAccountService.INSTANCE) {
            MailAccountService.INSTANCE = new MailAccountService();
        }
        return MailAccountService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'mailaccounts';

    public objectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT;

    private constructor() {
        super([new MailAccountFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType;
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
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        return;
        // const id = super.executeUpdateOrCreateRequest(
        //     token, clientRequestId, parameter, this.RESOURCE_URI, KIXObjectType.MAIL_ACCOUNT, 'MailAccountID', true
        // ).catch((error: Error) => {
        //     LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
        //     throw new Error(error.Code, error.Message);
        // });

        // return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        return;
        // const uri = this.buildUri(this.RESOURCE_URI, objectId);

        // const id = super.executeUpdateOrCreateRequest(
        //     token, clientRequestId, parameter, uri, KIXObjectType.MAIL_ACCOUNT, 'MailAccountID'
        // ).catch((error: Error) => {
        //     LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
        //     throw new Error(error.Code, error.Message);
        // });

        // return id;
    }
}
