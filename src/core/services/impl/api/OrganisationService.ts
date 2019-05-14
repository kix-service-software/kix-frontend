import { KIXObjectService } from './KIXObjectService';
import {
    OrganisationFactory, KIXObjectType, KIXObjectLoadingOptions, Error
} from '../../../model';
import {
    CreateOrganisation, CreateOrganisationResponse, CreateOrganisationRequest,
    UpdateOrganisation, UpdateOrganisationRequest, UpdateOrganisationResponse
} from '../../../api';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';

export class OrganisationService extends KIXObjectService {

    private static INSTANCE: OrganisationService;

    public static getInstance(): OrganisationService {
        if (!OrganisationService.INSTANCE) {
            OrganisationService.INSTANCE = new OrganisationService();
        }
        return OrganisationService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'organisations';

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    private constructor() {
        super([new OrganisationFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.ORGANISATION;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: string[], loadingOptions: KIXObjectLoadingOptions
    ): Promise<T[]> {

        const objects = await super.load(
            token, KIXObjectType.ORGANISATION, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.ORGANISATION
        );

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>
    ): Promise<string> {
        const createOrganisation = new CreateOrganisation(parameter);

        const response = await this.sendCreateRequest<CreateOrganisationResponse, CreateOrganisationRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateOrganisationRequest(createOrganisation),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.OrganisationID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateOrganisation = new UpdateOrganisation(parameter);

        const response = await this.sendUpdateRequest<UpdateOrganisationResponse, UpdateOrganisationRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateOrganisationRequest(updateOrganisation), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.OrganisationID;
    }

}
