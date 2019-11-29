/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService, ServiceRegistry } from "../kix";
import {
    KIXObjectType, FilterCriteria, FilterDataType, FilterType, TreeNode, ObjectIcon, DataType,
    KIXObject, KIXObjectLoadingOptions, KIXObjectProperty, TableFilterCriteria, Attachment
} from "../../model";
import { ContextService } from "../context";
import {
    FAQArticleProperty, FAQCategory, FAQCategoryProperty, FAQArticle,
    FAQArticleAttachmentLoadingOptions, FAQVote
} from "../../model/kix/faq";
import { SearchOperator } from "../SearchOperator";
import { ObjectDefinitionSearchAttribute } from "../../model/kix/object-definition";
import { BrowserUtil } from "../BrowserUtil";
import { TranslationService } from "../i18n/TranslationService";
import { FAQDetailsContext } from "./context/FAQDetailsContext";
import { KIXModulesSocketClient } from "../modules/KIXModulesSocketClient";
import { InlineContent } from "../components";

export class FAQService extends KIXObjectService {

    private static INSTANCE: FAQService;

    public static FAQ_SHOW_VOTE_EVENT_ID: string = 'FAQ_SHOW_VOTE_EVENT';

    public static getInstance(): FAQService {
        if (!FAQService.INSTANCE) {
            FAQService.INSTANCE = new FAQService();
        }
        return FAQService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(type: KIXObjectType) {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_VOTE
            || type === KIXObjectType.FAQ_VISIBILITY
            || type === KIXObjectType.FAQ_KEYWORD;
    }

    public getLinkObjectName(): string {
        return "FAQArticle";
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        const filter: FilterCriteria[] = [];

        const objectDefinitions = await KIXModulesSocketClient.getInstance().loadObjectDefinitions();
        let attributes: ObjectDefinitionSearchAttribute[] = [];
        const faqDefinition = objectDefinitions.find((od) => od.Object === KIXObjectType.FAQ_ARTICLE);
        if (faqDefinition) {
            attributes = faqDefinition.SearchAttributes;
        }

        attributes.forEach((sa) => {
            if (sa.Datatype === DataType.STRING) {
                filter.push(
                    new FilterCriteria(
                        sa.CorrespondingAttribute, SearchOperator.CONTAINS,
                        FilterDataType.STRING, FilterType.OR, searchValue
                    )
                );
            }
        });

        return filter;
    }

    public async getTreeNodes(
        property: string, showInvalid: boolean = false, invalidClickable: boolean = false,
        filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        const objectDefinitions = await KIXModulesSocketClient.getInstance().loadObjectDefinitions();
        let attributes: ObjectDefinitionSearchAttribute[] = [];
        const faqDefinition = objectDefinitions.find((od) => od.Object === KIXObjectType.FAQ_ARTICLE);
        if (faqDefinition) {
            attributes = faqDefinition.SearchAttributes;
        }

        switch (property) {
            case FAQArticleProperty.CATEGORY_ID:
            case FAQCategoryProperty.PARENT_ID:
                const loadingOptions = new KIXObjectLoadingOptions([
                    new FilterCriteria(
                        FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, null
                    )
                ], null, null, [FAQCategoryProperty.SUB_CATEGORIES], [FAQCategoryProperty.SUB_CATEGORIES]);
                const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
                    KIXObjectType.FAQ_CATEGORY, null, loadingOptions
                );
                nodes = await this.prepareObjectTree(
                    faqCategories, showInvalid, invalidClickable,
                    filterIds ? filterIds.map((fid) => Number(fid)) : null
                );
                break;
            case FAQArticleProperty.VISIBILITY:
                nodes = this.preparePossibleValueTree(attributes, FAQArticleProperty.VISIBILITY);
                break;
            case FAQArticleProperty.APPROVED:
                nodes = this.preparePossibleValueTree(attributes, FAQArticleProperty.APPROVED);
                break;
            case FAQArticleProperty.LANGUAGE:
                const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                    KIXObjectType.TRANSLATION_PATTERN
                );
                const languages = await translationService.getLanguages();
                nodes = languages.map((l) => new TreeNode(l[0], l[1]));
                break;
            case FAQArticleProperty.KEYWORDS:
                const keywords = await this.loadObjects(KIXObjectType.FAQ_KEYWORD, null);
                nodes = keywords ? keywords.map((k) => new TreeNode(k, k.toString())) : [];
                break;
            case FAQArticleProperty.CREATED_BY:
                nodes = await super.getTreeNodes(KIXObjectProperty.CREATE_BY, showInvalid, invalidClickable, filterIds);
                break;
            case FAQArticleProperty.CHANGED_BY:
                nodes = await super.getTreeNodes(KIXObjectProperty.CHANGE_BY, showInvalid, invalidClickable, filterIds);
                break;
            default:
                nodes = await super.getTreeNodes(property, showInvalid, invalidClickable, filterIds);
        }

        return nodes;
    }

    public async prepareObjectTree(
        faqCategories: FAQCategory[], showInvalid: boolean = false, invalidClickable: boolean = false,
        filterIds?: number[]
    ): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (faqCategories && !!faqCategories.length) {
            if (!showInvalid) {
                faqCategories = faqCategories.filter((c) => c.ValidID === 1);
            } else if (!invalidClickable) {
                faqCategories = faqCategories.filter(
                    (c) => c.ValidID === 1 || this.hasValidDescendants(c.SubCategories)
                );
            }

            if (filterIds && filterIds.length) {
                faqCategories = faqCategories.filter((c) => !filterIds.some((fid) => fid === c.ID));
            }

            for (const category of faqCategories) {
                const subTree = await this.prepareObjectTree(
                    category.SubCategories, showInvalid, invalidClickable, filterIds
                );

                const treeNode = new TreeNode(
                    category.ID, category.Name,
                    new ObjectIcon(KIXObjectType.FAQ_CATEGORY, category.ID),
                    null,
                    subTree,
                    null, null, null, null, null, null, null,
                    invalidClickable ? true : category.ValidID === 1,
                    undefined, undefined, undefined, undefined,
                    category.ValidID !== 1
                );

                nodes.push(treeNode);

            }
        }
        return nodes;
    }

    private hasValidDescendants(categories: FAQCategory[]): boolean {
        let hasValidDescendants: boolean = false;
        if (categories && !!categories.length) {
            for (const queue of categories) {
                if (queue.ValidID === 1) {
                    hasValidDescendants = true;
                } else {
                    hasValidDescendants = this.hasValidDescendants(queue.SubCategories);
                }
                if (hasValidDescendants) {
                    break;
                }
            }
        }
        return hasValidDescendants;
    }

    private preparePossibleValueTree(
        faqSearchAttributes: ObjectDefinitionSearchAttribute[],
        attributeName: FAQArticleProperty
    ): TreeNode[] {
        let nodes: TreeNode[] = [];
        if (faqSearchAttributes) {
            const attribute = faqSearchAttributes.find(
                (sa) => sa.CorrespondingAttribute === attributeName
            );
            if (attribute && attribute.PossibleValues.length) {
                nodes = attribute.PossibleValues.map((value: string | number) => {
                    const treeNode = new TreeNode(
                        value, value.toString(),
                        new ObjectIcon(FAQCategoryProperty.ID, attributeName),
                        null,
                    );
                    return treeNode;
                });
            }
        }
        return nodes;
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (property === FAQArticleProperty.ATTACHMENTS) {
            if (value && value.length) {
                const attachments = await this.prepareAttachments(value);
                parameter.push([FAQArticleProperty.ATTACHMENTS, attachments]);
            }
        } else if (property === FAQArticleProperty.KEYWORDS) {
            const keywords = value ? value.toString().split(' ') : [];
            parameter.push([property, keywords]);
        } else {
            parameter.push([property, value]);
        }

        return parameter;
    }

    private async prepareAttachments(files: Array<File | Attachment>): Promise<Attachment[]> {
        const attachments = [];
        const newFiles = files.filter((f) => f instanceof File);
        for (const f of newFiles) {
            const file = f as File;
            const attachment = new Attachment();
            attachment.ContentType = file.type !== '' ? file.type : 'text';
            attachment.Filename = file.name;
            attachment.Content = await BrowserUtil.readFile(file);
            attachments.push(attachment);
        }
        return [...attachments, ...files.filter((f) => !(f instanceof File))];
    }

    public determineDependendObjects(faqs: FAQArticle[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.TICKET) {
            ids = this.getLinkedObjectIds(faqs, KIXObjectType.TICKET);
        } else if (targetObjectType === KIXObjectType.CONFIG_ITEM) {
            ids = this.getLinkedObjectIds(faqs, KIXObjectType.CONFIG_ITEM);
        } else {
            ids = super.determineDependendObjects(faqs, targetObjectType);
        }

        return ids;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = await ContextService.getInstance().getContext(FAQDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

    protected getResource(objectType: KIXObjectType): string {
        if (objectType === KIXObjectType.FAQ_ARTICLE) {
            return 'faq/articles';
        } else if (objectType === KIXObjectType.FAQ_CATEGORY) {
            return 'faq/categories';
        }
    }

    public async getFAQArticleInlineContent(faqArticle: FAQArticle): Promise<InlineContent[]> {
        const inlineContent: InlineContent[] = [];
        if (faqArticle.Attachments) {
            const inlineAttachments = faqArticle.Attachments.filter((a) => a.Disposition === 'inline');
            for (const attachment of inlineAttachments) {
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['Content']);
                const faqArticleAttachmentOptions = new FAQArticleAttachmentLoadingOptions(
                    faqArticle.ID, attachment.ID
                );
                const attachments = await KIXObjectService.loadObjects<Attachment>(
                    KIXObjectType.FAQ_ARTICLE_ATTACHMENT, [attachment.ID], loadingOptions,
                    faqArticleAttachmentOptions
                );
                for (const attachmentItem of attachments) {
                    if (attachment.ID === attachmentItem.ID) {
                        attachment.Content = attachmentItem.Content;
                    }
                }
            }

            inlineAttachments.forEach(
                (a) => inlineContent.push(new InlineContent(a.ContentID, a.Content, a.ContentType))
            );
        }
        return inlineContent;
    }

    public async checkFilterValue(article: FAQArticle, criteria: TableFilterCriteria): Promise<boolean> {
        let match = false;
        if (criteria.property === FAQArticleProperty.VOTES && article && article.Votes) {
            const rating = BrowserUtil.calculateAverage(article.Votes.map((v) => v.Rating));
            match = (criteria.value as []).some((v: FAQVote) => v.Rating === rating);
        } else {
            match = await super.checkFilterValue(article, criteria);
        }
        return match;
    }

}
