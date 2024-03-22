/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { FAQArticleProperty } from '../../model/FAQArticleProperty';
import { FAQCategoryProperty } from '../../model/FAQCategoryProperty';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FAQCategory } from '../../model/FAQCategory';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { Attachment } from '../../../../model/kix/Attachment';
import { BrowserUtil } from '../../../../modules/base-components/webapp/core/BrowserUtil';
import { FAQArticle } from '../../model/FAQArticle';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { FAQDetailsContext } from './context/FAQDetailsContext';
import { UIFilterCriterion } from '../../../../model/UIFilterCriterion';
import { FAQVote } from '../../model/FAQVote';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../model/ContextMode';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { ObjectSearch } from '../../../object-search/model/ObjectSearch';
import { BackendSearchDataType } from '../../../../model/BackendSearchDataType';


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
        super(KIXObjectType.FAQ_ARTICLE);
        this.objectConstructors.set(KIXObjectType.FAQ_ARTICLE, [FAQArticle]);
        this.objectConstructors.set(KIXObjectType.FAQ_ARTICLE_ATTACHMENT, [Attachment]);
        this.objectConstructors.set(KIXObjectType.FAQ_CATEGORY, [FAQCategory]);
        this.objectConstructors.set(KIXObjectType.FAQ_VOTE, [FAQVote]);
    }

    public isServiceFor(type: KIXObjectType | string): boolean {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_VOTE
            || type === KIXObjectType.FAQ_KEYWORD;
    }

    public getLinkObjectName(): string {
        return 'FAQArticle';
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        const filter: FilterCriteria[] = [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.LIKE, FilterDataType.STRING, FilterType.OR, `*${searchValue}*`
            )
        ];

        return filter;
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

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
            case FAQArticleProperty.LANGUAGE:
                const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                    KIXObjectType.TRANSLATION_PATTERN
                );
                const languages = await translationService.getLanguages();
                nodes = [];
                for (const lang of languages) {
                    const displayValue = await TranslationService.translate(lang[1]);
                    nodes.push(new TreeNode(lang[0], displayValue));
                }
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
            case FAQArticleProperty.CUSTOMER_VISIBLE:
            case FAQArticleProperty.APPROVED:
                const yesText = await TranslationService.translate('Translatable#Yes');
                const noText = await TranslationService.translate('Translatable#No');
                nodes = [
                    new TreeNode(0, noText, 'kix-icon-close'),
                    new TreeNode(1, yesText, 'kix-icon-check')
                ];
                break;
            default:
                nodes = await super.getTreeNodes(property, showInvalid, invalidClickable, filterIds);
        }

        return nodes;
    }

    public async prepareObjectTree(
        objects: KIXObject[], showInvalid: boolean = false, invalidClickable: boolean = false,
        filterIds?: number[], translatable?: boolean
    ): Promise<TreeNode[]> {
        let nodes = [];
        if (objects?.length) {
            if (objects[0].KIXObjectType === KIXObjectType.FAQ_CATEGORY) {
                if (!showInvalid) {
                    objects = objects.filter((c) => c.ValidID === 1);
                } else if (!invalidClickable) {
                    objects = (objects as FAQCategory[]).filter(
                        (c) => c.ValidID === 1 || this.hasValidDescendants(c.SubCategories)
                    );
                }

                if (filterIds && filterIds.length) {
                    objects = objects.filter((tc) => !filterIds.some((fid) => fid === tc.ObjectId));
                }

                for (const category of (objects as FAQCategory[])) {
                    const subTree = await this.prepareObjectTree(
                        category.SubCategories, showInvalid, invalidClickable, filterIds
                    );

                    const treeNode = new TreeNode(
                        category.ID, category.Name,
                        new ObjectIcon(null, KIXObjectType.FAQ_CATEGORY, category.ID),
                        null,
                        subTree,
                        null, null, null, null, null, null, null,
                        invalidClickable ? true : category.ValidID === 1,
                        undefined, undefined, undefined, undefined,
                        category.ValidID !== 1
                    );
                    nodes.push(treeNode);
                }
            } else {
                nodes = await super.prepareObjectTree(objects, showInvalid, invalidClickable, filterIds, translatable);
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

    public determineDependendObjects(
        faqs: FAQArticle[], targetObjectType: KIXObjectType | string
    ): string[] | number[] {
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
        const context = ContextService.getInstance().getActiveContext();
        return context.descriptor.urlPaths[0] + '/' + id;
    }

    protected getResource(objectType: KIXObjectType | string): string {
        if (objectType === KIXObjectType.FAQ_ARTICLE) {
            return 'faq/articles';
        } else if (objectType === KIXObjectType.FAQ_CATEGORY) {
            return 'system/faq/categories';
        }
    }

    public async checkFilterValue(article: FAQArticle, criteria: UIFilterCriterion): Promise<boolean> {
        let match = false;
        if (criteria.property === FAQArticleProperty.VOTES) {
            const rating = BrowserUtil.round(article?.Rating || 0);
            match = (criteria.value as []).some((v: FAQVote) => v.Rating === rating);
        } else if (criteria.property === FAQArticleProperty.RATING) {
            const rating = BrowserUtil.round(article?.Rating || 0);
            match = (criteria.value as []).some((v: number) => BrowserUtil.round(v || 0) === rating);
        } else {
            match = await super.checkFilterValue(article, criteria);
        }
        return match;
    }

    public getObjectRoutingConfiguration(object: KIXObject): RoutingConfiguration {
        return new RoutingConfiguration(
            FAQDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE,
            ContextMode.DETAILS, FAQArticleProperty.ID
        );
    }

    public async getObjectProperties(objectType: KIXObjectType): Promise<string[]> {
        const superProperties = await super.getObjectProperties(objectType);
        const objectProperties: string[] = [
            FAQArticleProperty.NUMBER,
            FAQArticleProperty.TITLE,
            FAQArticleProperty.CUSTOMER_VISIBLE,
            FAQArticleProperty.LANGUAGE,
            FAQArticleProperty.RATING,
            FAQArticleProperty.CATEGORY_ID,
            FAQArticleProperty.FIELD_1,
            FAQArticleProperty.FIELD_2,
            FAQArticleProperty.FIELD_3,
            FAQArticleProperty.FIELD_6,
            FAQArticleProperty.KEYWORDS,
            FAQArticleProperty.APPROVED,

            FAQArticleProperty.CHANGED,
            FAQArticleProperty.CHANGED_BY,
            FAQArticleProperty.CREATED,
            FAQArticleProperty.CREATED_BY,
            KIXObjectProperty.VALID_ID
        ];
        return [...objectProperties, ...superProperties];
    }

    public async getObjectTypeForProperty(property: string): Promise<KIXObjectType | string> {
        let objectType = await super.getObjectTypeForProperty(property);

        if (objectType === this.objectType) {
            switch (property) {
                case FAQArticleProperty.CREATED_BY:
                case FAQArticleProperty.CHANGED_BY:
                    objectType = KIXObjectType.USER;
                    break;
                default:
            }
        }
        return objectType;
    }

    public async getSortableAttributes(filtered: boolean = true
    ): Promise<ObjectSearch[]> {
        const supportedAttributes = await super.getSortableAttributes(filtered);

        const filterList = [
            FAQArticleProperty.CATEGORY_ID,
            'CreatedUserIDs',
            'FAQArticleID',
            FAQArticleProperty.FIELD_4,
            FAQArticleProperty.FIELD_5,
            'LastChangedUserIDs',
            'Visibility',
            FAQArticleProperty.VOTES
        ];
        return filtered ?
            supportedAttributes.filter((sA) => !filterList.some((fp) => fp === sA.Property)) :
            supportedAttributes;
    }

    public getSortAttribute(attribute: string, dep?: string): string {
        switch (attribute) {
            case FAQArticleProperty.CATEGORY_ID:
                return FAQArticleProperty.CATEGORY;
            case FAQArticleProperty.CHANGED_BY:
                return KIXObjectProperty.CHANGE_BY;
            case FAQArticleProperty.CHANGED:
                return KIXObjectProperty.CHANGE_TIME;
            case FAQArticleProperty.CREATED_BY:
                return KIXObjectProperty.CREATE_BY;
            case FAQArticleProperty.CREATED:
                return KIXObjectProperty.CREATE_TIME;
            default:
        }
        return super.getSortAttribute(attribute, dep);
    }

    protected async isBackendFilterSupportedForProperty(
        objectType: KIXObjectType | string, property: string, supportedAttributes: ObjectSearch[], dep?: string
    ): Promise<boolean> {
        const filterList = [
            // TODO: currently date/time is not supported (in FE)
            FAQArticleProperty.CREATED,
            FAQArticleProperty.CHANGED,

            FAQArticleProperty.RATING
        ];
        if (filterList.some((f) => f === property)) {
            return false;
        }
        return super.isBackendFilterSupportedForProperty(objectType, property, supportedAttributes, dep);
    }

    protected async getBackendFilterType(property: string, dep?: string): Promise<BackendSearchDataType | string> {
        switch (property) {
            case FAQArticleProperty.LANGUAGE:
            case FAQArticleProperty.CATEGORY_ID:
            case FAQArticleProperty.CUSTOMER_VISIBLE:
                return BackendSearchDataType.NUMERIC;
            default:
        }
        return super.getBackendFilterType(property, dep);
    }

    public async getFilterAttribute(attribute: string, dep?: string): Promise<string> {
        switch (attribute) {
            case FAQArticleProperty.CHANGED_BY:
                // TODO: when supported use CHANGE_BY_ID
                return KIXObjectProperty.CHANGE_BY;
            case FAQArticleProperty.CHANGED:
                return KIXObjectProperty.CHANGE_TIME;
            case FAQArticleProperty.CREATED_BY:
                // TODO: when supported use CREATE_BY_ID
                return KIXObjectProperty.CREATE_BY;
            case FAQArticleProperty.CREATED:
                return KIXObjectProperty.CREATE_TIME;
            default:
        }
        return super.getFilterAttribute(attribute, dep);
    }

    public getObjectDependencies(objectType: KIXObjectType): Promise<KIXObject[]> {
        return KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
    }
}
