import { KIXObjectService } from './KIXObjectService';
import { ClientRegistration, SortOrder, KIXObjectType, SystemInfo, Error } from '../../../model';
import {
    CreateClientRegistration,
    CreateClientRegistrationResponse,
    CreateClientRegistrationRequest,
    ClientRegistrationsResponse
} from '../../../api';
import { LoggingService } from '../LoggingService';

export class ClientRegistrationService extends KIXObjectService {

    private static INSTANCE: ClientRegistrationService;

    public static getInstance(): ClientRegistrationService {
        if (!ClientRegistrationService.INSTANCE) {
            ClientRegistrationService.INSTANCE = new ClientRegistrationService();
        }
        return ClientRegistrationService.INSTANCE;
    }

    private constructor() {
        super();
    }


    protected RESOURCE_URI: string = "clientregistration";

    public objectType: KIXObjectType = KIXObjectType.CLIENT_REGISTRATION;

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CLIENT_REGISTRATION;
    }

    public async getClientRegistrations(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ClientRegistration[]> {

        const response = await this.getObjects<ClientRegistrationsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.ClientRegistration;
    }

    public async createClientRegistration(
        token: string, clientRequestId: string, createClientRegistration: CreateClientRegistration
    ): Promise<SystemInfo> {

        const uri = this.buildUri(this.RESOURCE_URI, createClientRegistration.ClientID);
        await this.sendDeleteRequest(token, clientRequestId, uri, null)
            .catch(
                (error) => LoggingService.getInstance().debug(
                    'Could not delete client registration: ' + createClientRegistration.ClientID
                )
            );

        const response =
            await this.sendCreateRequest<CreateClientRegistrationResponse, CreateClientRegistrationRequest>(
                token, clientRequestId,
                this.RESOURCE_URI, new CreateClientRegistrationRequest(createClientRegistration),
                null
            );

        return response.SystemInfo;
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

    public async deleteClientRegistration(token: string, clientRequestId: string, clientId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, clientId);
        await this.sendDeleteRequest<void>(token, clientRequestId, uri, null);
    }

}
