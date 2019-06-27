import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error, MailFilter, MailFilterProperty
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import { MailFilterFactory } from '../../object-factories/MailFilterFactory';

export class MailFilterService extends KIXObjectService {

    private static INSTANCE: MailFilterService;

    public static getInstance(): MailFilterService {
        if (!MailFilterService.INSTANCE) {
            MailFilterService.INSTANCE = new MailFilterService();
        }
        return MailFilterService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'system/communication/mailfilters';

    public objectType: KIXObjectType = KIXObjectType.MAIL_FILTER;

    private constructor() {
        super([new MailFilterFactory()]);
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
        if (objectType === KIXObjectType.MAIL_FILTER) {
            objects = await super.load<MailFilter>(
                token, KIXObjectType.MAIL_FILTER, this.RESOURCE_URI, loadingOptions, objectIds, 'MailFilter'
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
