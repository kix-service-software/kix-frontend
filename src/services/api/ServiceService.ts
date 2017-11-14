import {
    IServiceService, Service, SortOrder, ServicesResponse, ServiceResponse,
    CreateService, CreateServiceRequest, CreateServiceResponse,
    UpdateService, UpdateServiceRequest, UpdateServiceResponse
} from "@kix/core/";
import { ObjectService } from './ObjectService';

export class ServiceService extends ObjectService<Service> implements IServiceService {

    protected RESOURCE_URI: string = "services";

    public async getServices(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Service[]> {

        const response = await this.getObjects<ServicesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Service;
    }

    public async getService(token: string, serviceId: number, query?: any): Promise<Service> {
        const response = await this.getObject<ServiceResponse>(
            token, serviceId
        );

        return response.Service;
    }

    public async createService(token: string, createService: CreateService): Promise<number> {
        const response = await this.createObject<CreateServiceResponse, CreateServiceRequest>(
            token, this.RESOURCE_URI, new CreateServiceRequest(createService)
        );

        return response.ServiceID;
    }

    public async updateService(
        token: string, serviceId: number, updateService: UpdateService
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, serviceId);
        const response = await this.updateObject<UpdateServiceResponse, UpdateServiceRequest>(
            token, uri, new UpdateServiceRequest(updateService)
        );

        return response.ServiceID;
    }

    public async deleteService(token: string, groupId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, groupId);
        await this.deleteObject<void>(token, uri);
    }

}
