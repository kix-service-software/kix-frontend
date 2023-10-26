/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../server/model/Error';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { Attachment } from '../../../model/kix/Attachment';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectSpecificDeleteOptions } from '../../../model/KIXObjectSpecificDeleteOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { SearchOperator } from '../../search/model/SearchOperator';
import { SearchProperty } from '../../search/model/SearchProperty';
import { CreateFAQVoteOptions } from '../model/CreateFAQVoteOptions';
import { FAQArticle } from '../model/FAQArticle';
import { FAQArticleAttachmentLoadingOptions } from '../model/FAQArticleAttachmentLoadingOptions';
import { FAQArticleProperty } from '../model/FAQArticleProperty';
import { FAQCategory } from '../model/FAQCategory';


export class FAQService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = 'faq/articles';

    protected objectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE;

    private static INSTANCE: FAQService;

    public static getInstance(): FAQService {
        if (!FAQService.INSTANCE) {
            FAQService.INSTANCE = new FAQService();
        }
        return FAQService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType | string): boolean {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_VOTE
            || type === KIXObjectType.FAQ_KEYWORD;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {
        let objectResponse = new ObjectResponse();

        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                objectResponse = await super.load(
                    token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'FAQArticle',
                    clientRequestId, FAQArticle
                );
                break;
            case KIXObjectType.FAQ_CATEGORY:
                const categoryUri = this.buildUri('system', 'faq', 'categories');
                objectResponse = await super.load(
                    token, objectType, categoryUri, loadingOptions, objectIds, 'FAQCategory',
                    clientRequestId, FAQCategory
                );
                break;
            case KIXObjectType.FAQ_ARTICLE_ATTACHMENT:
                const attachment = await this.loadAttachment(
                    token, loadingOptions, (objectLoadingOptions as FAQArticleAttachmentLoadingOptions)
                );
                objectResponse = new ObjectResponse(attachment, 1);
                break;
            case KIXObjectType.FAQ_KEYWORD:
                const uri = this.buildUri(this.RESOURCE_URI, 'keywords');
                objectResponse = await super.load<string>(
                    token, KIXObjectType.FAQ_KEYWORD, uri, null, null, 'FAQKeyword', clientRequestId
                );
                break;
            default:
        }

        return objectResponse as ObjectResponse<T>;
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                return this.createFAQArticle(token, clientRequestId, parameter);
            case KIXObjectType.FAQ_VOTE:
                return this.createFAQVote(token, clientRequestId, parameter, (createOptions as CreateFAQVoteOptions));
            case KIXObjectType.FAQ_CATEGORY:
                return this.createFAQCategory(token, clientRequestId, parameter);
            default:
                const error = 'No create option for object type ' + objectType;
                throw error;
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, objectId: number
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                return this.updateFAQArticle(token, clientRequestId, parameter, objectId);
            case KIXObjectType.FAQ_CATEGORY:
                return this.updateFAQCategory(token, clientRequestId, parameter, objectId);
            default:
                const error = 'No update option for object type ' + objectType;
                throw error;
        }
    }

    private async updateAttachments(
        token: string, clientRequestId: string, objectId: number, attachments: Attachment[]
    ): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId, 'attachments');

        const objectResponse = await super.load<Attachment>(
            token, KIXObjectType.FAQ_ARTICLE_ATTACHMENT, uri, null, null, 'Attachment', clientRequestId, Attachment
        );

        const existingAttachments = objectResponse.objects || [];
        const deletableAttachments = existingAttachments
            ? existingAttachments.filter((a) => a.Disposition !== 'inline' && !attachments.some((at) => at.ID === a.ID))
            : [];

        for (const attachment of deletableAttachments) {
            const attachmentUri = this.buildUri(this.RESOURCE_URI, objectId, 'attachments', attachment.ID);
            await this.sendDeleteRequest(token, clientRequestId, [attachmentUri], this.objectType);
        }

        const newAttachments = attachments ? attachments.filter((a) => !a.ID) : [];
        for (const attachment of newAttachments) {
            const parameter: Array<[string, any]> = [];
            for (const p in attachment) {
                if (attachment[p]) {
                    parameter.push([p, attachment[p]]);
                }
            }

            await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, KIXObjectType.FAQ_ARTICLE_ATTACHMENT, 'AttachmentID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }
    }

    private async createFAQArticle(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {
        const createParameter = parameter.filter((p) => p[0] !== KIXObjectProperty.LINKS);

        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, createParameter, this.RESOURCE_URI, this.objectType, 'FAQArticleID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        await this.createLinks(
            token, clientRequestId, id, this.getParameterValue(parameter, KIXObjectProperty.LINKS)
        );

        return id;
    }

    private async updateFAQArticle(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, objectId: number
    ): Promise<number> {
        const updateParameter = parameter.filter(
            (p) => p[0] !== KIXObjectProperty.LINKS && p[0] !== FAQArticleProperty.ATTACHMENTS
        );

        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, updateParameter, uri, this.objectType, 'FAQArticleID'
        );

        const attachments = parameter.find((p) => p[0] === FAQArticleProperty.ATTACHMENTS);
        await this.updateAttachments(
            token, clientRequestId, objectId, attachments && attachments.length ? attachments[1] : []
        );

        return id;
    }

    public async updateFAQCategory(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, objectId: number
    ): Promise<number> {
        const uri = this.buildUri('system', 'faq', 'categories', objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.FAQ_CATEGORY, 'FAQCategoryID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    private async createFAQVote(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, createOptions: CreateFAQVoteOptions
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, createOptions.faqArticleId, 'votes');

        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.FAQ_VOTE, 'FAQVoteID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async createFAQCategory(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {
        const uri = this.buildUri('system', 'faq', 'categories');

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.FAQ_CATEGORY, 'FAQCategoryID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async loadAttachment(
        token: string, loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: FAQArticleAttachmentLoadingOptions
    ): Promise<Attachment[]> {
        if (objectLoadingOptions) {
            const uri = this.buildUri(
                this.RESOURCE_URI, objectLoadingOptions.faqArticleId,
                'attachments', objectLoadingOptions.attachmentId
            );

            const objectResponse = await super.load<Attachment>(
                token, null, uri, loadingOptions, null, 'Attachment', 'FAQService', Attachment
            );
            return objectResponse.objects || [];
        } else {
            const error = 'No FAQArticleAttachmentLoadingOptions given.';
            throw error;
        }
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const filterCriteria = criteria.filter(
            (f) => f.property !== SearchProperty.PRIMARY && !f.property.match(/Field\d/)
        );
        return filterCriteria;
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string, ressourceUri: string = this.RESOURCE_URI
    ): Promise<Error[]> {
        if (objectType === KIXObjectType.FAQ_CATEGORY) {
            ressourceUri = 'system/faq/categories';
        }

        return super.deleteObject(
            token, clientRequestId, objectType, objectId, deleteOptions, cacheKeyPrefix, ressourceUri
        );
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const primary = criteria.find((f) => f.property === SearchProperty.PRIMARY);
        if (primary) {
            const primarySearch = [
                new FilterCriteria(
                    FAQArticleProperty.NUMBER, SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.OR, `${primary.value}`
                ),
            ];
            criteria = [...criteria, ...primarySearch];
        }

        const categoryCriteria = criteria.find((c) => c.property === FAQArticleProperty.CATEGORY_ID);
        if (categoryCriteria && categoryCriteria.operator === SearchOperator.EQUALS) {
            categoryCriteria.operator = SearchOperator.IN;
            categoryCriteria.value = [categoryCriteria.value as any];
        }

        criteria = criteria.filter((c) => c.property !== KIXObjectProperty.VALID_ID);

        return criteria;
    }

}
