import {
    FAQCategory, FAQArticleProperty, FAQArticle, FAQArticleFactory,
    Attachment, FAQArticleAttachmentLoadingOptions, CreateFAQVoteOptions, FAQCacheHandler
} from "../../../model/kix/faq";
import { KIXObjectService } from "./KIXObjectService";
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions,
    KIXObjectCache
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

    private static INSTANCE: FAQService;

    public static getInstance(): FAQService {
        if (!FAQService.INSTANCE) {
            FAQService.INSTANCE = new FAQService();
        }
        return FAQService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.getInstance().registerServiceInstance(this);
        KIXObjectCache.registerCacheHandler(new FAQCacheHandler());
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
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
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
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                return this.createFAQArticle(token, parameter);
            case KIXObjectType.FAQ_VOTE:
                return this.createFAQVote(token, parameter, (createOptions as CreateFAQVoteOptions));
            default:
                const error = 'No create option for object type ' + objectType;
                throw error;
        }
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number
    ): Promise<string | number> {

        const updateFAQArticle = new UpdateFAQArticle(
            parameter.filter((p) => p[0] !== FAQArticleProperty.LINK && p[0] !== FAQArticleProperty.ATTACHMENTS)
        );

        const response = await this.sendUpdateRequest<UpdateFAQArticleResponse, UpdateFAQArticleRequest>(
            token, this.buildUri(this.RESOURCE_URI, 'articles', objectId), new UpdateFAQArticleRequest(updateFAQArticle)
        ).catch((error) => {
            throw error;
        });

        const attachments = parameter.find((p) => p[0] === FAQArticleProperty.ATTACHMENTS);
        if (attachments && attachments.length) {
            await this.updateAttachments(token, objectId, attachments[1]);
        }

        return response.FAQArticleID;
    }

    private async updateAttachments(token: string, objectId: number, attachments: Attachment[]): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, 'articles', objectId, 'attachments');

        const attachmentsResponse = await this.getObjectByUri<FAQArticleAttachmentsResponse>(token, uri, {
            fields: 'Attachment.ID'
        });
        const existingAttachments = attachmentsResponse.Attachment;

        const deletableAttachments = existingAttachments ?
            existingAttachments.filter((a) => !attachments.some((at) => at.ID === a.ID)) : [];

        for (const attachment of deletableAttachments) {
            const attachmentUri = this.buildUri(this.RESOURCE_URI, 'articles', objectId, 'attachments', attachment.ID);
            await this.sendDeleteRequest(token, attachmentUri);
        }

        const newAttachments = attachments ? attachments.filter((a) => !a.ID) : [];
        for (const attachment of newAttachments) {
            await this.sendCreateRequest<CreateFAQArticleAttachmentResponse, CreateFAQArticleAttachmentRequest>(
                token, this.buildUri(this.RESOURCE_URI, 'articles', objectId, 'attachments'),
                new CreateFAQArticleAttachmentRequest(attachment)
            ).catch((error) => {
                LoggingService.getInstance().error(error);
            });
        }
    }

    private async createFAQArticle(token: string, parameter: Array<[string, any]>): Promise<number> {
        const createFAQArticle = new CreateFAQArticle(parameter.filter((p) => p[0] !== FAQArticleProperty.LINK));

        const uri = this.buildUri(this.RESOURCE_URI, 'articles');
        const response = await this.sendCreateRequest<CreateFAQArticleResponse, CreateFAQArticleRequest>(
            token, uri, new CreateFAQArticleRequest(createFAQArticle)
        ).catch((error) => {
            throw error;
        });

        const faqId = response.FAQArticleID;

        await this.createLinks(token, faqId, this.getParameterValue(parameter, FAQArticleProperty.LINK));

        return faqId;
    }

    private async createFAQVote(
        token: string, parameter: Array<[string, any]>, createOptions: CreateFAQVoteOptions
    ): Promise<number> {
        const createFAQVote = new CreateFAQVote(parameter);
        const uri = this.buildUri(this.RESOURCE_URI, 'articles', createOptions.faqArticleId, 'votes');
        const response = await this.sendCreateRequest<CreateFAQVoteResponse, CreateFAQVoteRequest>(
            token, uri, new CreateFAQVoteRequest(createFAQVote)
        ).catch((error) => {
            throw error;
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
