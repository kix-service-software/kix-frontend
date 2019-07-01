import { KIXObjectService, ServiceRegistry } from "../kix";
import {
    KIXObjectType, FilterCriteria, FilterDataType, FilterType, TreeNode, ObjectIcon, DataType,
    KIXObject, KIXObjectLoadingOptions, ValidObject
} from "../../model";
import { ContextService } from "../context";
import {
    FAQArticleProperty, Attachment, FAQCategory, FAQCategoryProperty, FAQArticle
} from "../../model/kix/faq";
import { SearchOperator } from "../SearchOperator";
import { ObjectDefinitionSearchAttribute } from "../../model/kix/object-definition";
import { BrowserUtil } from "../BrowserUtil";
import { TranslationService } from "../i18n/TranslationService";
import { FAQDetailsContext } from "./context/FAQDetailsContext";
import { KIXModulesSocketClient } from "../modules/KIXModulesSocketClient";

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
            || type === KIXObjectType.FAQ_VISIBILITY;
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
        property: string, showInvalid: boolean = false, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

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
                values = this.prepareCategoryTree(
                    faqCategories, showInvalid,
                    filterIds ? filterIds.map((fid) => Number(fid)) : null
                );
                break;
            case FAQArticleProperty.VISIBILITY:
                values = this.preparePossibleValueTree(attributes, FAQArticleProperty.VISIBILITY);
                break;
            case FAQArticleProperty.APPROVED:
                values = this.preparePossibleValueTree(attributes, FAQArticleProperty.APPROVED);
                break;
            case FAQArticleProperty.LANGUAGE:
                const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                    KIXObjectType.TRANSLATION_PATTERN
                );
                const languages = await translationService.getLanguages();
                values = languages.map((l) => new TreeNode(l[0], l[1]));
                break;
            case FAQArticleProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                values = validObjects.map((vo) => new TreeNode(Number(vo.ID), vo.Name));
                break;
            default:
        }

        return values;
    }

    private prepareCategoryTree(
        faqCategories: FAQCategory[], showInvalid: boolean = false, filterIds?: number[]
    ): TreeNode[] {
        let nodes: TreeNode[] = [];
        if (faqCategories && !!faqCategories.length) {
            if (!showInvalid) {
                faqCategories = faqCategories.filter((c) => c.ValidID === 1);
            }
            if (filterIds && filterIds.length) {
                faqCategories = faqCategories.filter((c) => !filterIds.some((fid) => fid === c.ID));
            }

            nodes = faqCategories.map((category: FAQCategory) => {
                const treeNode = new TreeNode(
                    category.ID, category.Name,
                    new ObjectIcon(KIXObjectType.FAQ_CATEGORY, category.ID),
                    null,
                    this.prepareCategoryTree(category.SubCategories, showInvalid, filterIds),
                    null, null, null, null, null, null, null, category.ValidID === 1 ? true : false
                );
                return treeNode;
            });
        }
        return nodes;
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

}
