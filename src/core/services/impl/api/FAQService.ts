import {
    FAQCategory, FAQArticleProperty, FAQArticle, FAQArticleFactory,
    Attachment, FAQArticleAttachmentLoadingOptions, CreateFAQVoteOptions
} from "../../../model/kix/faq";
import { KIXObjectService } from "./KIXObjectService";
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error
} from "../../../model";
import {
    FAQCategoriesResponse, FAQCategoryResponse, FAQArticlesResponse, FAQArticleResponse, CreateFAQArticle,
    CreateFAQArticleResponse, CreateFAQArticleRequest, FAQArticleAttachmentResponse, CreateFAQVote,
    CreateFAQVoteResponse, CreateFAQVoteRequest, UpdateFAQArticle, UpdateFAQArticleResponse, UpdateFAQArticleRequest,
    CreateFAQArticleAttachmentResponse, CreateFAQArticleAttachmentRequest, FAQArticleAttachmentsResponse
} from "../../../api/faq";
import { KIXObjectServiceRegistry } from "../../KIXObjectServiceRegistry";
import { LoggingService } from "../LoggingService";

export class FAQService extends KIXObjectService {

    protected objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

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

    public isServiceFor(type: KIXObjectType): boolean {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_CATEGORY_HIERARCHY
            || type === KIXObjectType.FAQ_VOTE;
    }

    protected RESOURCE_URI: string = 'faq';

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                objects = await this.getArticles(token, objectIds, loadingOptions);
                break;
            case KIXObjectType.FAQ_CATEGORY:
            case KIXObjectType.FAQ_CATEGORY_HIERARCHY:
                objects = await this.getCategories(token, objectIds, loadingOptions);
                break;
            case KIXObjectType.FAQ_ARTICLE_ATTACHMENT:
                objects = await this.loadAttachment(
                    token, loadingOptions, (objectLoadingOptions as FAQArticleAttachmentLoadingOptions)
                );
                break;
            default:
        }

        return objects;
    }

    private async getArticles(
        token: string, articleIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<FAQArticle[]> {

        loadingOptions = loadingOptions || new KIXObjectLoadingOptions();
        if (loadingOptions.includes && !!loadingOptions.includes.length) {
            if (!loadingOptions.includes.some((i) => i === FAQArticleProperty.VOTES)) {
                loadingOptions.includes = [...loadingOptions.includes, FAQArticleProperty.VOTES];
            }
            if (!loadingOptions.expands.some((i) => i === FAQArticleProperty.VOTES)) {
                loadingOptions.expands = [...loadingOptions.expands, FAQArticleProperty.VOTES];
            }
        } else {
            loadingOptions.includes = [FAQArticleProperty.VOTES];
            loadingOptions.expands = [FAQArticleProperty.VOTES];
        }

        const query = this.prepareQuery(loadingOptions);

        let faqArticles: FAQArticle[] = [];

        if (articleIds && articleIds.length) {
            articleIds = articleIds.filter((id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null);
            const uri = this.buildUri(this.RESOURCE_URI, 'articles', articleIds.join(','));
            const response = await this.getObjectByUri<FAQArticlesResponse | FAQArticleResponse>(token, uri, query);
            if (articleIds.length === 1) {
                faqArticles = [(response as FAQArticleResponse).FAQArticle];
            } else {
                faqArticles = (response as FAQArticlesResponse).FAQArticle;
            }
        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'FAQArticle', token, query);
            const uri = this.buildUri(this.RESOURCE_URI, 'articles');
            const response = await this.getObjectByUri<FAQArticlesResponse>(token, uri, query);
            faqArticles = response.FAQArticle;
        } else {
            const uri = this.buildUri(this.RESOURCE_URI, 'articles');
            const response = await this.getObjectByUri<FAQArticlesResponse>(token, uri, query);
            faqArticles = response.FAQArticle;
        }

        return faqArticles.map((faq) => FAQArticleFactory.create(faq));
    }

    private async getCategories(
        token: string, categoryIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<FAQCategory[]> {
        const ids = categoryIds ? categoryIds.join(',') : null;
        let uri = this.buildUri(this.RESOURCE_URI, 'categories');
        if (ids) {
            uri = this.buildUri(this.RESOURCE_URI, 'categories', ids);
        }

        const query = this.prepareQuery(loadingOptions);
        if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'FAQCategory', token, query);
        }

        const response = await this.getObjectByUri<FAQCategoriesResponse | FAQCategoryResponse>(token, uri, query);
        let result = [];
        if (categoryIds && categoryIds.length === 1) {
            result = [(response as FAQCategoryResponse).FAQCategory];
        } else {
            result = (response as FAQCategoriesResponse).FAQCategory;
        }
        return result.map((fc) => new FAQCategory(fc));
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                return this.createFAQArticle(token, clientRequestId, parameter);
            case KIXObjectType.FAQ_VOTE:
                return this.createFAQVote(token, clientRequestId, parameter, (createOptions as CreateFAQVoteOptions));
            default:
                const error = 'No create option for object type ' + objectType;
                throw error;
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number
    ): Promise<string | number> {

        const updateFAQArticle = new UpdateFAQArticle(
            parameter.filter((p) => p[0] !== FAQArticleProperty.LINK && p[0] !== FAQArticleProperty.ATTACHMENTS)
        );

        const response = await this.sendUpdateRequest<UpdateFAQArticleResponse, UpdateFAQArticleRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, 'articles', objectId),
            new UpdateFAQArticleRequest(updateFAQArticle), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const attachments = parameter.find((p) => p[0] === FAQArticleProperty.ATTACHMENTS);
        await this.updateAttachments(
            token, clientRequestId, objectId, attachments && attachments.length ? attachments[1] : []
        );

        return response.FAQArticleID;
    }

    private async updateAttachments(
        token: string, clientRequestId: string, objectId: number, attachments: Attachment[]
    ): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, 'articles', objectId, 'attachments');

        const attachmentsResponse = await this.getObjectByUri<FAQArticleAttachmentsResponse>(token, uri);
        const existingAttachments = attachmentsResponse.Attachment;

        const deletableAttachments = existingAttachments
            ? existingAttachments.filter((a) => a.Disposition !== 'inline' && !attachments.some((at) => at.ID === a.ID))
            : [];

        for (const attachment of deletableAttachments) {
            const attachmentUri = this.buildUri(this.RESOURCE_URI, 'articles', objectId, 'attachments', attachment.ID);
            await this.sendDeleteRequest(token, clientRequestId, attachmentUri, this.objectType);
        }

        const newAttachments = attachments ? attachments.filter((a) => !a.ID) : [];
        for (const attachment of newAttachments) {
            await this.sendCreateRequest<CreateFAQArticleAttachmentResponse, CreateFAQArticleAttachmentRequest>(
                token, clientRequestId, this.buildUri(this.RESOURCE_URI, 'articles', objectId, 'attachments'),
                new CreateFAQArticleAttachmentRequest(attachment), this.objectType
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }
    }

    private async createFAQArticle(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {
        const createFAQArticle = new CreateFAQArticle(parameter.filter((p) => p[0] !== FAQArticleProperty.LINK));

        const uri = this.buildUri(this.RESOURCE_URI, 'articles');
        const response = await this.sendCreateRequest<CreateFAQArticleResponse, CreateFAQArticleRequest>(
            token, clientRequestId, uri, new CreateFAQArticleRequest(createFAQArticle), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const faqId = response.FAQArticleID;

        await this.createLinks(
            token, clientRequestId, faqId, this.getParameterValue(parameter, FAQArticleProperty.LINK)
        );

        return faqId;
    }

    private async createFAQVote(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, createOptions: CreateFAQVoteOptions
    ): Promise<number> {
        const createFAQVote = new CreateFAQVote(parameter);
        const uri = this.buildUri(this.RESOURCE_URI, 'articles', createOptions.faqArticleId, 'votes');
        const response = await this.sendCreateRequest<CreateFAQVoteResponse, CreateFAQVoteRequest>(
            token, clientRequestId, uri, new CreateFAQVoteRequest(createFAQVote), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const faqId = response.FAQVoteID;
        return faqId;
    }

    public async loadAttachment(
        token: string, loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: FAQArticleAttachmentLoadingOptions
    ): Promise<Attachment[]> {
        if (objectLoadingOptions) {
            const uri = this.buildUri(
                this.RESOURCE_URI,
                'articles', objectLoadingOptions.faqArticleId,
                'attachments', objectLoadingOptions.attachmentId
            );
            const query = this.prepareQuery(loadingOptions);
            const response = await this.getObjectByUri<FAQArticleAttachmentResponse>(token, uri, query);
            return [response.Attachment];
        } else {
            const error = 'No FAQArticleAttachmentLoadingOptions given.';
            throw error;
        }
    }

}
