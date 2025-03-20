/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public searchValueKey: '';
    private multiselect: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.nodes = input.nodes;
        this.searchValueKey = input.searchValueKey ?? '';
        this.multiselect = input.multiselect || false;
    }

    public async onMount(): Promise<void> {
        // ...
    }

    public onUpdate(): void {
        // ...
    }

    public nodeSelected(node: TreeNode, event: any): void {
        if (this.hasChildren(node)) {
            this.stopEventPropagation(event);
        }
        this.setDirtyAndUpdateNode(node);
    }

    public childNodeSelected(node: TreeNode, event: any): void {
        if (this.hasChildren(node)) {
            this.stopEventPropagation(event);
        }
        this.setDirtyAndUpdateNode(node);
    }

    private setDirtyAndUpdateNode(node: TreeNode): void {
        (this as any).emit('nodeSelected', node);
        (this as any).setStateDirty('nodes');
    }

    public hasChildren(node: TreeNode): boolean {
        if (Array.isArray(node.children) && node.children.length > 0) return true;
        return false;
    }

    public getAccordionId(label: string): string {
        return `${this.searchValueKey}_${label}`;
    }

    private stopEventPropagation(event: any): void {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        if (event.preventDefault) {
            event.preventDefault();
        }
    }

}

module.exports = Component;