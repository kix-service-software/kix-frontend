/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { Error } from '../../../../../server/model/Error';
import { CreateLink } from './api/CreateLink';
import { CreateLinkResponse } from './api/CreateLinkResponse';
import { CreateLinkRequest } from './api/CreateLinkRequest';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { CreateLinkObjectOptions } from './api/CreateLinkObjectOptions';
import { LinkObjectProperty } from '../model/LinkObjectProperty';
import { LinkType } from '../model/LinkType';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class LinkAPIService extends KIXObjectAPIService {

    private static INSTANCE: LinkAPIService;

    public static getInstance(): LinkAPIService {
        if (!LinkAPIService.INSTANCE) {
            LinkAPIService.INSTANCE = new LinkAPIService();
        }
        return LinkAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'links';

    public objectType: KIXObjectType = KIXObjectType.LINK;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }
    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.LINK
            || kixObjectType === KIXObjectType.LINK_OBJECT
            || kixObjectType === KIXObjectType.LINK_TYPE;
    }

    public async loadObjects<O>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<O>> {

        let objectResponse = new ObjectResponse();

        if (objectType === KIXObjectType.LINK_TYPE) {
            const baseUri = this.buildUri(this.RESOURCE_URI, 'types');
            objectResponse = await super.load(
                token, KIXObjectType.LINK_TYPE, baseUri, loadingOptions, objectIds, 'LinkType', clientRequestId, LinkType
            );
        }

        return objectResponse as ObjectResponse<O>;
    }

    public async createLink(token: string, clientRequestId: string, createLink: CreateLink): Promise<number> {
        const response = await this.sendCreateRequest<CreateLinkResponse, CreateLinkRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateLinkRequest(createLink), this.objectType
        );

        return response.LinkID;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.LINK_OBJECT:
                const options = (createOptions as CreateLinkObjectOptions);
                return await this.createLinkFromLinkObject(
                    token, clientRequestId, parameter, options
                );
            default:
                throw new Error('', 'No create option for object type ' + objectType);
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', 'Method not implemented.');
    }

    private async createLinkFromLinkObject(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, createOptions: CreateLinkObjectOptions
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

        return await this.createLink(token, clientRequestId, link);
    }

    public async deleteLink(token: string, clientRequestId: string, linkId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, linkId);
        await this.sendDeleteRequest<void>(token, clientRequestId, [uri], this.objectType);
    }

}
