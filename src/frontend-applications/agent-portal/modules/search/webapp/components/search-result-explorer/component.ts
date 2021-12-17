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
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { SearchContext } from '../../core';
import { KIXObject } from '../../../../../model/kix/KIXObject';


export class Component {

    private state: ComponentState;
    private rootCategory: SearchResultCategory;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();

        this.state.contextId = context.contextId;
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        await this.prepareTree();

        const activeCategory = context.getSearchResultCategory();
        if (activeCategory) {
            this.state.activeNode = this.getActiveNode(activeCategory.objectType);
        }

        context.registerListener('search-result-explorer', {
            additionalInformationChanged: () => null,
            filteredObjectListChanged: () => null,
            objectChanged: () => null,
            objectListChanged: async (objectType: KIXObjectType | string, objects: KIXObject[]) => {
                if (objectType === context?.getSearchCache()?.objectType) {
                    this.prepareTree();
                }
            },
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null
        });
    }

    private async prepareTree(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        this.rootCategory = context.getSearchResultCategory();
        this.state.nodes = this.rootCategory ? await this.prepareTreeNodes([this.rootCategory], true) : [];
    }

    private async prepareTreeNodes(categories: SearchResultCategory[], isRoot: boolean = false): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];

        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const searchCache = context?.getSearchCache();
        if (searchCache && categories) {
            const objectService = ServiceRegistry.getServiceInstance<IKIXObjectService>(searchCache.objectType);
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
                        category,
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

    public async activeNodeChanged(node: TreeNode, forceSet: boolean = false): Promise<void> {
        this.state.activeNode = node;
        if (this.state.activeNode) {
            const newActiveCategory = this.getActiveCategory(this.state.activeNode.id.objectType);
            const context = ContextService.getInstance().getActiveContext<SearchContext>();
            const activeCategory = await context.getSearchResultCategory();
            if (forceSet || !activeCategory || newActiveCategory.label !== activeCategory.label) {
                context.setSearchResultCategory(newActiveCategory);
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
        let activeNode = nodes.find((n) => n.id.objectType === objectType);
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
