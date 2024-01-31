/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { CheckListItem } from '../../../core/CheckListItem';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TreeHandler, TreeService, TreeNode } from '../../../../../base-components/webapp/core/tree';

class Component extends AbstractMarkoComponent<ComponentState> {

    private treeHandler: TreeHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.item = input.item;
    }

    public onDestroy(): void {
        TreeService.getInstance().removeTreeHandler(this.state.treeId);
    }

    public async onMount(): Promise<void> {
        const tree = [
            new TreeNode('OK', 'OK', 'kix-icon-check'),
            new TreeNode('NOK', 'NOK', 'kix-icon-exclamation'),
            new TreeNode('pending', 'pending', 'kix-icon-time-wait'),
            new TreeNode('n.a.', 'n.a.', 'kix-icon-unknown'),
            new TreeNode('-', '-')
        ];
        this.treeHandler = new TreeHandler(tree, null, null, false);

        const selectedItem = tree.find((t) => t.id === this.state.item.value);
        if (selectedItem) {
            this.treeHandler.setSelection([selectedItem]);
        }
        TreeService.getInstance().registerTreeHandler(this.state.treeId, this.treeHandler);

        this.state.prepared = true;
    }

    public valueChanged(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        this.state.item.value = event.target.value;
        (this as any).emit('itemValueChanged', this.state.item);
    }

    public async nodesChanged(nodes: TreeNode[]): Promise<void> {
        if (nodes && nodes.length) {
            this.state.item.value = nodes[0].id;
        } else {
            this.state.item.value = '-';
        }
        (this as any).emit('itemValueChanged', this.state.item);
    }

    public itemValueChanged(item: CheckListItem): void {
        (this as any).emit('itemValueChanged', item);
    }

}

module.exports = Component;
