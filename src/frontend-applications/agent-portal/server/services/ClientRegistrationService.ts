/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from './KIXObjectAPIService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SortOrder } from '../../model/SortOrder';
import { ClientRegistration } from '../model/ClientRegistration';
import { ClientRegistrationsResponse } from '../model/ClientRegistrationsResponse';
import { LoggingService } from '../../../../server/services/LoggingService';
import { CreateClientRegistrationResponse } from '../model/CreateClientRegistrationResponse';
import { CreateClientRegistrationRequest } from '../model/CreateClientRegistrationRequest';
import { CreateClientRegistration } from '../model/CreateClientRegistration';
import { SystemInfo } from '../../model/SystemInfo';

export class ClientRegistrationService extends KIXObjectAPIService {

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

    protected RESOURCE_URI: string = 'clientregistrations';

    public objectType: KIXObjectType | string = KIXObjectType.CLIENT_REGISTRATION;

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
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
        await this.sendDeleteRequest(token, clientRequestId, [uri], null)
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

    public async deleteClientRegistration(token: string, clientRequestId: string, clientId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, clientId);
        await this.sendDeleteRequest<void>(token, clientRequestId, [uri], null);
    }

}
