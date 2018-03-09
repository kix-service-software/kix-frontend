import {
    ServicesResponse, ServiceResponse,
    CreateService, CreateServiceRequest, CreateServiceResponse,
    UpdateService, UpdateServiceRequest, UpdateServiceResponse
} from "@kix/core/dist/api";

import { IServiceService } from '@kix/core/dist/services';
import { Service, SortOrder } from '@kix/core/dist/model';

import { ObjectService } from './ObjectService';

export class ServiceService extends ObjectService<Service> implements IServiceService {

    protected RESOURCE_URI: string = "services";

    public async getServices(token: string): Promise<Service[]> {
        const query = {
            fields: 'Service.ServiceID,Service.Name',
            include: 'IncidentState'
        };

        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<ServicesResponse>(token, uri, query);
        return response.Service;
    }
}
