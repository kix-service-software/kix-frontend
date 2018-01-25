import { ObjectService } from './ObjectService';
import { IStandardAttachmentService } from '@kix/core/dist/services';
import { StandardAttachment } from '@kix/core/dist/model';
import {
    CreateStandardAttachment,
    CreateStandardAttachmentResponse,
    CreateStandardAttachmentRequest,
    StandardAttachmentsResponse,
    StandardAttachmentResponse,
    UpdateStandardAttachment,
    UpdateStandardAttachmentResponse,
    UpdateStandardAttachmentRequest
} from '@kix/core/dist/api';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class StandardAttachmentService extends ObjectService<StandardAttachment> implements IStandardAttachmentService {

    protected RESOURCE_URI: string = "standardattachments";

    public async getStandardAttachments(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<StandardAttachment[]> {

        const response = await this.getObjects<StandardAttachmentsResponse>(
            token, limit, order, changedAfter, query
        );

        return response.StandardAttachment;
    }

    public async getStandardAttachment(
        token: string, standardAttachmentId: number, query?: any
    ): Promise<StandardAttachment> {
        const response = await this.getObject<StandardAttachmentResponse>(
            token, standardAttachmentId
        );

        return response.StandardAttachment;
    }

    public async createStandardAttachment(
        token: string, createStandardAttachment: CreateStandardAttachment
    ): Promise<number> {
        const response = await this.createObject<CreateStandardAttachmentResponse, CreateStandardAttachmentRequest>(
            token, this.RESOURCE_URI, new CreateStandardAttachmentRequest(createStandardAttachment)
        );

        return response.StandardAttachmentID;
    }

    public async updateStandardAttachment(
        token: string, standardAttachmentId: number, updateStandardAttachment: UpdateStandardAttachment
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, standardAttachmentId);
        const response = await this.updateObject<UpdateStandardAttachmentResponse, UpdateStandardAttachmentRequest>(
            token, uri, new UpdateStandardAttachmentRequest(updateStandardAttachment)
        );

        return response.StandardAttachmentID;
    }

    public async deleteStandardAttachment(token: string, standardAttachmentId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, standardAttachmentId);
        await this.deleteObject<void>(token, uri);
    }

}
