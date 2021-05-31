/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { SearchResultCategory } from '../../core/SearchResultCategory';
import { IdService } from '../../../../../model/IdService';
import { SearchService } from '../../core/SearchService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IKIXObjectSearchListener } from '../../core/IKIXObjectSearchListener';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';


export class Component implements IKIXObjectSearchListener {

    private state: ComponentState;
    private rootCategory: SearchResultCategory;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('search-result-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        SearchService.getInstance().registerListener(this);
        const context = ContextService.getInstance().getActiveContext();
        this.state.contextId = context.contextId;
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;
        this.prepareTree();
        const activeCategory = SearchService.getInstance().getActiveSearchResultExplorerCategory();
        if (activeCategory) {
            this.state.activeNode = this.getActiveNode(activeCategory.objectType);
        }
    }

    public searchCleared(): void {
        SearchService.getInstance().setActiveSearchResultExplorerCategory(null);
        this.state.nodes = null;
    }

    public async searchFinished(): Promise<void> {
        await this.prepareTree();
        this.activeNodeChanged(this.state.nodes[0], true);
    }

    public searchResultCategoryChanged(): void {
        return;
    }

    private async prepareTree(): Promise<void> {
        this.rootCategory = await SearchService.getInstance().getSearchResultCategories();
        this.state.nodes = this.rootCategory ? await this.prepareTreeNodes([this.rootCategory], true) : [];
    }

    private async prepareTreeNodes(categories: SearchResultCategory[], isRoot: boolean = false): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        const searchCache = SearchService.getInstance().getSearchCache();
        if (searchCache && categories) {
            const objectService
                = ServiceRegistry.getServiceInstance<IKIXObjectService>(searchCache.objectType);
            if (objectService) {
                for (const category of categories) {
                    if (isRoot) {
                        category.objectIds = searchCache.result.map((o) => o.ObjectId.toString());
                    } else {
                        category.objectIds = objectService.determineDependendObjects(
                            searchCache.result, category.objectType
                        ) || [];
                    }

                    const label = await TranslationService.translate(category.label);
                    const children = await this.prepareTreeNodes(category.children);

                    nodes.push(new TreeNode(
                        category.objectType,
                        label + ` (${category.objectIds.length})`,
                        null, null,
                        children,
                        null, null, null, null, isRoot
                    ));
                }
            }
        }
        return nodes;
    }

    public activeNodeChanged(node: TreeNode, forceSet: boolean = false): void {
        this.state.activeNode = node;
        if (this.state.activeNode) {
            const newActiveCategory = this.getActiveCategory(this.state.activeNode.id);
            const activeCategory = SearchService.getInstance().getActiveSearchResultExplorerCategory();
            if (forceSet || !activeCategory || newActiveCategory.label !== activeCategory.label) {
                SearchService.getInstance().setActiveSearchResultExplorerCategory(newActiveCategory);
            }
        }
    }

    private getActiveCategory(
        objectType: KIXObjectType | string,
        categories: SearchResultCategory[] = [this.rootCategory]
    ): SearchResultCategory {
        let activeCategory = categories.find((c) => c.objectType === objectType);
        if (!activeCategory) {
            for (const category of categories) {
                activeCategory = this.getActiveCategory(objectType, category.children);
                if (activeCategory) {
                    break;
                }
            }
        }
        return activeCategory;
    }

    private getActiveNode(
        objectType: KIXObjectType | string,
        nodes: TreeNode[] = this.state.nodes
    ): TreeNode {
        let activeNode = nodes.find((n) => n.id === objectType);
        if (!activeNode) {
            for (const node of nodes) {
                activeNode = this.getActiveNode(objectType, node.children);
                if (activeNode) {
                    break;
                }
            }
        }
        return activeNode;
    }
}

module.exports = Component;
