import { ObjectService } from './ObjectService';
import { ISignatureService } from '@kix/core/dist/services';
import { Signature } from '@kix/core/dist/model';
import {
    CreateSignature,
    CreateSignatureResponse,
    CreateSignatureRequest,
    SignaturesResponse,
    SignatureResponse,
    UpdateSignature,
    UpdateSignatureResponse,
    UpdateSignatureRequest
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class SignatureService extends ObjectService<Signature> implements ISignatureService {

    protected RESOURCE_URI: string = "signatures";

    public async getSignatures(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Signature[]> {

        const response = await this.getObjects<SignaturesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Signature;
    }

    public async getSignature(token: string, signatureId: number, query?: any): Promise<Signature> {
        const response = await this.getObject<SignatureResponse>(
            token, signatureId
        );

        return response.Signature;
    }

    public async createSignature(token: string, createSignature: CreateSignature): Promise<number> {
        const response = await this.createObject<CreateSignatureResponse, CreateSignatureRequest>(
            token, this.RESOURCE_URI, new CreateSignatureRequest(createSignature)
        );

        return response.SignatureID;
    }

    public async updateSignature(
        token: string, signatureId: number, updateSignature: UpdateSignature
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, signatureId);
        const response = await this.updateObject<UpdateSignatureResponse, UpdateSignatureRequest>(
            token, uri, new UpdateSignatureRequest(updateSignature)
        );

        return response.SignatureID;
    }

    public async deleteSignature(token: string, signatureId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, signatureId);
        await this.deleteObject<void>(token, uri);
    }

}
