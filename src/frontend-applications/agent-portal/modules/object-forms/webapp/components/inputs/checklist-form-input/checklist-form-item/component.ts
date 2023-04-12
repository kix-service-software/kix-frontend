/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TreeNode } from '../../../../../../base-components/webapp/core/tree';
import { CheckListItem } from '../../../../../../dynamic-fields/webapp/core/CheckListItem';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.item = input.item;
    }

    public async onMount(): Promise<void> {
        this.state.nodes = [
            new TreeNode('OK', 'OK', 'kix-icon-check'),
            new TreeNode('NOK', 'NOK', 'kix-icon-exclamation'),
            new TreeNode('pending', 'pending', 'kix-icon-time-wait'),
            new TreeNode('n.a.', 'n.a.', 'kix-icon-unknown'),
            new TreeNode('-', '-')
        ];

        this.state.selectedNode = this.state.nodes.find((n) => n.id.toLowerCase() === this.state.item?.value.toLowerCase() && n.id !== '-');

        this.state.prepared = true;
    }

    public valueChanged(event: any): void {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        if (event.preventDefault) {
            event.preventDefault();
        }

        this.state.item.value = event.target.value;
        (this as any).emit('itemValueChanged', this.state.item);
    }

    public async nodeSelected(node: TreeNode): Promise<void> {
        this.state.selectedNode = node;
        if (this.state.selectedNode) {
            this.state.item.value = this.state.selectedNode.id;
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
