import { KIXObjectService } from './KIXObjectService';
import {
    LinkType, KIXObjectType, CreateLinkObjectOptions,
    KIXObjectSpecificCreateOptions, LinkObjectProperty, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectCache, LinkCacheHandler, Error
} from '../../../model';
import {
    CreateLink, CreateLinkResponse, CreateLinkRequest, LinkTypesResponse, LinkTypeResponse
} from '../../../api';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

export class LinkService extends KIXObjectService {

    private static INSTANCE: LinkService;

    public static getInstance(): LinkService {
        if (!LinkService.INSTANCE) {
            LinkService.INSTANCE = new LinkService();
        }
        return LinkService.INSTANCE;
    }

    protected RESOURCE_URI: string = "links";

    public kixObjectType: KIXObjectType = KIXObjectType.LINK;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
        KIXObjectCache.registerCacheHandler(new LinkCacheHandler());
    }
    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.LINK
            || kixObjectType === KIXObjectType.LINK_OBJECT
            || kixObjectType === KIXObjectType.LINK_TYPE;
    }

    public async loadObjects<O>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {

        let objects = [];

        if (objectType === KIXObjectType.LINK_TYPE) {
            objects = await this.getLinkTypes(token, objectIds, loadingOptions);
        }

        return objects;
    }

    public async getLinkTypes(
        token: string, linkTypeIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<LinkType[]> {

        const ids = linkTypeIds ? linkTypeIds.join(',') : null;
        let uri = this.buildUri(this.RESOURCE_URI, 'types');
        if (ids) {
            uri = this.buildUri(this.RESOURCE_URI, 'types', ids);
        }

        const query = this.prepareQuery(loadingOptions);
        if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'LinkType', token, query);
        }

        const response = await this.getObjectByUri<LinkTypeResponse | LinkTypesResponse>(token, uri, query);
        let result = [];
        if (linkTypeIds && linkTypeIds.length === 1) {
            result = [(response as LinkTypeResponse).LinkType];
        } else {
            result = (response as LinkTypesResponse).LinkType;
        }

        return result.map((lt) => new LinkType(lt));
    }

    public async createLink(token: string, createLink: CreateLink): Promise<number> {
        const response = await this.sendCreateRequest<CreateLinkResponse, CreateLinkRequest>(
            token, this.RESOURCE_URI, new CreateLinkRequest(createLink)
        );

        return response.LinkID;
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.LINK_OBJECT:
                const options = (createOptions as CreateLinkObjectOptions);
                return await this.createLinkFromLinkObject(
                    token, parameter, options
                );
            default:
                throw new Error('', 'No create option for object type ' + objectType);
        }
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    private async createLinkFromLinkObject(
        token: string, parameter: Array<[string, any]>, createOptions: CreateLinkObjectOptions
    ): Promise<number> {

        const isSource = this.getParameterValue(parameter, LinkObjectProperty.IS_SOURCE);
        const linkType: LinkType = this.getParameterValue(parameter, LinkObjectProperty.LINK_TYPE);

        const paramType = this.getParameterValue(parameter, LinkObjectProperty.LINKED_OBJECT_TYPE);
        const paramKey = this.getParameterValue(parameter, LinkObjectProperty.LINKED_OBJECT_KEY);

        const link = new CreateLink(
            isSource ? paramType : createOptions.rootObject.KIXObjectType,
            isSource ? paramKey : createOptions.rootObject.ObjectId,
            isSource ? createOptions.rootObject.KIXObjectType : paramType,
            isSource ? createOptions.rootObject.ObjectId : paramKey,
            linkType.Name
        );

        KIXObjectCache.removeObject(createOptions.rootObject.KIXObjectType, createOptions.rootObject.ObjectId);
        KIXObjectCache.removeObject(paramType, paramKey);

        return await this.createLink(token, link);
    }

    public async deleteLink(token: string, linkId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, linkId);
        await this.sendDeleteRequest<void>(token, uri);
    }

}
