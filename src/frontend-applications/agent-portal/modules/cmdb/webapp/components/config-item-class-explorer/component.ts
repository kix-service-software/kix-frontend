/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { CMDBContext } from '../../core';
import { TreeNode, TreeNodeProperty } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';

export class Component {

    private state: ComponentState;
    private subscriber: IEventSubscriber;

    public listenerId: string;
    public textFilterValue: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('config-item-class-explorer-');
    }

    public async onMount(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = ['ConfigItemStats'];
        loadingOptions.cacheType = `${KIXObjectType.CONFIG_ITEM_CLASS}_STATS`;

        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null, loadingOptions, null, false
        );
        this.state.nodes = await this.prepareTreeNodes(ciClasses);

        const context = ContextService.getInstance().getActiveContext() as CMDBContext;
        if (context) {
            this.state.widgetConfiguration = await context.getWidgetConfiguration(this.state.instanceId);
            this.state.activeNode = this.getActiveNode(context.classId);
        }

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                this.state.activeNode = this.getActiveNode(context?.classId);
            }
        };

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_PARAMETER_CHANGED, this.subscriber);
    }

    private getActiveNode(classId: number, nodes: TreeNode[] = this.state.nodes
    ): TreeNode {
        let activeNode = nodes?.find((n) => n.id === classId);
        if (!activeNode && Array.isArray(nodes)) {
            for (const node of nodes) {
                activeNode = this.getActiveNode(classId, node.children);
                if (activeNode) {
                    node.expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private async prepareTreeNodes(configItemClasses: ConfigItemClass[]): Promise<TreeNode[]> {
        const nodes = [];
        if (Array.isArray(configItemClasses)) {
            const ciClasses = configItemClasses.filter((c) => c.ValidID === 1);
            for (const c of ciClasses) {
                let count = '0';
                if (c.ConfigItemStats) {
                    count = (c.ConfigItemStats.PreProductiveCount + c.ConfigItemStats.ProductiveCount).toString();
                }

                const text = await TranslationService.translate('Translatable#Config Items Count: {0}', [count]);

                const properties = [new TreeNodeProperty(count, text)];
                const name = await TranslationService.translate(c.Name, []);
                const icon = LabelService.getInstance().getObjectIcon(c);
                nodes.push(new TreeNode(c.ID, name, icon, null, null, null, null, null, properties));
            }
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof CMDBContext) {
            context.setAdditionalInformation('STRUCTURE', [node.label]);
            context.setCIClass(node.id);
        }
    }

    public async showAll(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context instanceof CMDBContext) {
            this.state.activeNode = null;
            this.state.filterValue = null;

            const allText = await TranslationService.translate('Translatable#All');
            context.setAdditionalInformation('STRUCTURE', [allText]);

            context.setCIClass(null);

            (this as any).getComponent('ci-class-explorer-filter').reset();
        }
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
    }

}

module.exports = Component;
