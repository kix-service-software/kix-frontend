import { ObjectService } from './ObjectService';
import { IClientRegistrationService } from '@kix/core/dist/services';
import { ClientRegistration, SortOrder } from '@kix/core/dist/model';
import {
    CreateClientRegistration,
    CreateClientRegistrationResponse,
    CreateClientRegistrationRequest,
    ClientRegistrationsResponse,
    ClientRegistrationResponse
} from '@kix/core/dist/api';

export class ClientRegistrationService extends ObjectService<ClientRegistration> implements IClientRegistrationService {

    protected RESOURCE_URI: string = "clientregistration";

    public async getClientRegistrations(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<ClientRegistration[]> {

        const response = await this.getObjects<ClientRegistrationsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.ClientRegistration;
    }

    public async createClientRegistration(
        token: string, createClientRegistration: CreateClientRegistration
    ): Promise<string> {
        const response = await this.createObject<CreateClientRegistrationResponse, CreateClientRegistrationRequest>(
            token, this.RESOURCE_URI, new CreateClientRegistrationRequest(createClientRegistration)
        );

        return response.ClientID;
    }

    public async deleteClientRegistration(token: string, clientId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, clientId);
        await this.deleteObject<void>(token, uri);
    }

}
