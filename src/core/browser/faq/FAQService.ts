import { KIXObjectService, ServiceRegistry } from "../kix";
import {
    KIXObjectType, FilterCriteria, FilterDataType, FilterType, TreeNode, ObjectIcon, DataType,
    KIXObject,
    KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions
} from "../../model";
import { ContextService } from "../context";
import { FAQDetailsContext } from "./context";
import {
    FAQArticleProperty, Attachment, FAQCategory, FAQCategoryProperty, FAQArticle
} from "../../model/kix/faq";
import { SearchOperator } from "../SearchOperator";
import { ObjectDefinitionSearchAttribute } from "../../model/kix/object-definition";
import { BrowserUtil } from "../BrowserUtil";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";

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
            || type === KIXObjectType.FAQ_VOTE;
    }

    public getLinkObjectName(): string {
        return "FAQArticle";
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.FAQ_CATEGORY) {
            objects = await super.loadObjects<O>(KIXObjectType.FAQ_CATEGORY, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public prepareFullTextFilter(searchValue: string): FilterCriteria[] {
        const filter: FilterCriteria[] = [];

        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            let faqSearchAttributes: ObjectDefinitionSearchAttribute[];
            const faqDefinition = objectData.objectDefinitions.find((od) => od.Object === KIXObjectType.FAQ_ARTICLE);
            if (faqDefinition) {
                faqSearchAttributes = faqDefinition.SearchAttributes;
            }
            if (faqSearchAttributes) {
                faqSearchAttributes.forEach((sa) => {
                    if (sa.Datatype === DataType.STRING) {
                        filter.push(
                            new FilterCriteria(
                                sa.CorrespondingAttribute, SearchOperator.CONTAINS,
                                FilterDataType.STRING, FilterType.OR, searchValue
                            )
                        );
                    }
                });
            }
        }

        return filter;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            // TODO: im Moment nur für Suche, auch für Create umsetzen, ggf. mit Varible (isSearch) abfragen?
            let faqSearchAttributes: ObjectDefinitionSearchAttribute[];
            const faqDefinition = objectData.objectDefinitions.find((od) => od.Object === KIXObjectType.FAQ_ARTICLE);
            if (faqDefinition) {
                faqSearchAttributes = faqDefinition.SearchAttributes;
            }

            switch (property) {
                case FAQArticleProperty.CATEGORY_ID:
                    const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                    values = this.prepareCategoryTree(faqCategories);
                    break;
                case FAQArticleProperty.VISIBILITY:
                    values = this.preparePossibleValueTree(faqSearchAttributes, FAQArticleProperty.VISIBILITY);
                    break;
                case FAQArticleProperty.APPROVED:
                    values = this.preparePossibleValueTree(faqSearchAttributes, FAQArticleProperty.APPROVED);
                    break;
                case FAQArticleProperty.LANGUAGE:
                    const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                        KIXObjectType.TRANSLATION
                    );
                    const languages = await translationService.getLanguages();
                    values = languages.map((l) => new TreeNode(l[0], l[1]));
                    break;
                case FAQArticleProperty.VALID_ID:
                    values = objectData.validObjects.map((vo) => new TreeNode(Number(vo.ID), vo.Name));
                    break;
                default:
            }
        }

        return values;
    }

    private prepareCategoryTree(faqCategories: FAQCategory[]): TreeNode[] {
        let nodes: TreeNode[] = [];
        if (faqCategories) {
            nodes = faqCategories.map((category: FAQCategory) => {
                const treeNode = new TreeNode(
                    category.ID, category.Name,
                    new ObjectIcon(FAQCategoryProperty.ID, category.ID),
                    null,
                    this.prepareCategoryTree(category.SubCategories)
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

}
