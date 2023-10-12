/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TreeNode, TreeService, TreeUtil } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { GraphContextOption } from '../../../model/GraphContextOption';
import { GraphContextOptions } from '../../../model/GraphContextOptions';
import { GraphContext } from '../../core/GraphContext';
import { GraphInstance } from '../../core/GraphInstance';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private context: GraphContext;

    public onCreate(): void {
        this.state = new ComponentState();

    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Default', 'Translatable#Apply'
        ]);

        this.context = ContextService.getInstance().getActiveContext();
        const graphInstance = await this.context?.getObject<GraphInstance>(KIXObjectType.GRAPH_INSTANCE);

        this.state.options = await graphInstance.getGraphOptions();

        setTimeout(() => {
            const contextOptions: GraphContextOption[] = this.context.getAdditionalInformation(
                GraphContextOptions.GRAPH_OPTIONS
            );
            this.state.options?.forEach((o) => {
                const treeHandler = TreeService.getInstance().getTreeHandler(o.key);
                const tree = o.nodes;
                treeHandler.setTree(tree);

                const option = contextOptions?.find((co) => co.key === o.key);
                if (option && Array.isArray(option.value) && option.value.length) {
                    const selection: TreeNode[] = [];
                    option.value.forEach((v) => {
                        const node = TreeUtil.findNode(tree, v);
                        if (node) {
                            selection.push(node);
                        }

                    });
                    treeHandler.setSelection(selection);
                }
            });
        }, 200);
    }

    public apply(): void {
        const graphContextOptions = this.state.options.map((o) => {
            const treeHandler = TreeService.getInstance().getTreeHandler(o.key);
            const values = treeHandler.getSelectedNodes().map((n) => n.id);
            return new GraphContextOption(o.key, values, o.multiselect);
        });
        this.context.setGraphOptions(graphContextOptions);
    }

}

module.exports = Component;
