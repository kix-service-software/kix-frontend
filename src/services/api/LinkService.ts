import { ObjectService } from './ObjectService';
import { ILinkService } from '@kix/core/dist/services';
import { Link, LinkType, SortOrder } from '@kix/core/dist/model';
import {
    CreateLink,
    CreateLinkResponse,
    CreateLinkRequest,
    LinksResponse,
    LinkResponse,
    LinkTypesResponse
} from '@kix/core/dist/api';

export class LinkService extends ObjectService<Link> implements ILinkService {

    protected RESOURCE_URI: string = "links";

    public async getLinks(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Link[]> {

        const response = await this.getObjects<LinksResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Link;
    }

    public async getLink(token: string, linkId: number, query?: any): Promise<Link> {
        const response = await this.getObject<LinkResponse>(
            token, linkId
        );

        return response.Link;
    }

    public async getLinkTypes(token: string): Promise<LinkType[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'types');
        const response = await this.getObjectByUri<LinkTypesResponse>(token, uri);

        return response.LinkType;
    }

    public async createLink(token: string, createLink: CreateLink): Promise<number> {
        const response = await this.createObject<CreateLinkResponse, CreateLinkRequest>(
            token, this.RESOURCE_URI, new CreateLinkRequest(createLink)
        );

        return response.LinkID;
    }

    public async deleteLink(token: string, linkId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, linkId);
        await this.deleteObject<void>(token, uri);
    }

}
