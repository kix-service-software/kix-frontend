/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../../model/IdService';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { FAQContext } from '../../../core/context/FAQContext';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FAQCategoryProperty } from '../../../../model/FAQCategoryProperty';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { FAQCategory } from '../../../../model/FAQCategory';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { LabelService } from '../../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectService } from '../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { SortUtil } from '../../../../../../model/SortUtil';
import { DataType } from '../../../../../../model/DataType';
import { ContextEvents } from '../../../../../base-components/webapp/core/ContextEvents';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';

export class Component {

    private state: ComponentState;
    private subscriber: IEventSubscriber;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('faq-category-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as FAQContext;
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        const categoryFilter = [
            new FilterCriteria(
                FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, null
            )
        ];
        const loadingOptions = new KIXObjectLoadingOptions(categoryFilter, null, null,
            ['SubCategories', 'Articles'], ['SubCategories']
        );

        const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
            KIXObjectType.FAQ_CATEGORY, null, loadingOptions
        );

        this.state.nodes = await this.prepareTreeNodes(faqCategories);

        this.state.activeNode = this.getActiveNode(context.categoryId);

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                this.state.activeNode = this.getActiveNode(context?.categoryId);
            }
        };

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    private getActiveNode(categoryId: number, nodes: TreeNode[] = this.state.nodes
    ): TreeNode {
        let activeNode = nodes?.find((n) => n.id === categoryId);
        if (!activeNode) {
            for (const node of nodes) {
                activeNode = this.getActiveNode(categoryId, node.children);
                if (activeNode) {
                    node.expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private async prepareTreeNodes(categories: FAQCategory[]): Promise<TreeNode[]> {
        const nodes = [];
        if (categories) {
            for (const category of categories) {
                const label = await this.getCategoryLabel(category);
                const children = await this.prepareTreeNodes(category.SubCategories);
                const icon = LabelService.getInstance().getObjectIcon(category);
                const node = new TreeNode(category.ID, label, icon);
                node.children = children;
                node.selectable = category.ValidID === 1;
                nodes.push(node);
            }
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    private async getCategoryLabel(category: FAQCategory): Promise<string> {
        const name = await TranslationService.translate(category.Name, []);
        const count = this.countArticles(category);
        return `${name} (${count})`;
    }

    private countArticles(category: FAQCategory): number {
        let count = category.Articles ? category.Articles.length : 0;

        if (category.SubCategories) {
            category.SubCategories.forEach((c) => count += this.countArticles(c));
        }

        return count;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;

        const context = ContextService.getInstance().getActiveContext() as FAQContext;
        context.setAdditionalInformation('STRUCTURE', [node.label]);
        context.setFAQCategoryId(node.id);
    }

    public async showAll(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as FAQContext;
        this.state.activeNode = null;
        const allText = await TranslationService.translate('Translatable#All');
        context.setAdditionalInformation('STRUCTURE', [allText]);
        context.setFAQCategoryId(null);
    }

}

module.exports = Component;
