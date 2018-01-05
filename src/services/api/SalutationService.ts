import { ObjectService } from './ObjectService';
import { ISalutationService } from '@kix/core/dist/services';
import { Salutation } from '@kix/core/dist/model';
import {
    CreateSalutation,
    CreateSalutationResponse,
    CreateSalutationRequest,
    SalutationsResponse,
    SalutationResponse,
    UpdateSalutation,
    UpdateSalutationResponse,
    UpdateSalutationRequest
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class SalutationService extends ObjectService<Salutation> implements ISalutationService {

    protected RESOURCE_URI: string = "salutations";

    public async getSalutations(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Salutation[]> {

        const response = await this.getObjects<SalutationsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Salutation;
    }

    public async getSalutation(token: string, salutationId: number, query?: any): Promise<Salutation> {
        const response = await this.getObject<SalutationResponse>(
            token, salutationId
        );

        return response.Salutation;
    }

    public async createSalutation(token: string, createSalutation: CreateSalutation): Promise<number> {
        const response = await this.createObject<CreateSalutationResponse, CreateSalutationRequest>(
            token, this.RESOURCE_URI, new CreateSalutationRequest(createSalutation)
        );

        return response.SalutationID;
    }

    public async updateSalutation(
        token: string, salutationId: number, updateSalutation: UpdateSalutation
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, salutationId);
        const response = await this.updateObject<UpdateSalutationResponse, UpdateSalutationRequest>(
            token, uri, new UpdateSalutationRequest(updateSalutation)
        );

        return response.SalutationID;
    }

    public async deleteSalutation(token: string, salutationId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, salutationId);
        await this.deleteObject<void>(token, uri);
    }

}
