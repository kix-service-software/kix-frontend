/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeNode } from '../../../core/tree';
import { BrowserUtil } from '../../../core/BrowserUtil';

class TreeNodeComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;

        if (this.state.node) {
            if (!this.state.node.expandOnClick) {
                this.state.node.expandOnClick = !this.state.node.selectable;
            }
        }

        this.state.activeNode = input.activeNode;
        (this as any).setStateDirty('activeNode');
        this.state.treeId = input.treeId;
        this.state.nodeId = this.state.treeId + '-node-' + this.state.node.id;

        if (input.expandIfActiveChild && !this.state.node.expanded && this.hasActiveChild()) {
            this.state.node.expanded = true;
        }

        if (this.isNodeActive()) {
            setTimeout(() => {
                const element = (this as any).getEl(this.state.nodeId);
                BrowserUtil.scrollIntoViewIfNeeded(element);
            }, 100);
        }
    }

    private hasClickableChildren(tree: TreeNode[]): boolean {
        for (const t of tree) {
            if (t.selectable) {
                return true;
            }

            if (t.children && t.children.length) {
                const hasChildren = this.hasClickableChildren(t.children);
                if (hasChildren) {
                    return true;
                }
            }
        }
        return false;
    }

    public onDestroy(): void {
        this.state.node = null;
    }

    public hasChildren(): boolean {
        return (this.state.node.children && this.state.node.children.length > 0);
    }

    public getLabel(): string {
        let title = this.state.node.label;
        if (this.state.node.properties) {
            const values = this.state.node.properties.map((prop) => prop.value);
            title += ' (' + values.join('|') + ')';
        }
        return title;
    }

    private isNodeActive(): boolean {
        return this.state.activeNode && this.state.activeNode.id === this.state.node.id;
    }

    public hasActiveChild(): boolean {
        return this.state.activeNode &&
            this.state.node.children &&
            this.checkForActiveChild(this.state.node.children);
    }

    private checkForActiveChild(children: TreeNode[]): boolean {
        return children && children.length && children.some(
            (c) => c.id === this.state.activeNode.id || this.checkForActiveChild(c.children)
        );
    }

    public toggleNode(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).emit('nodeToggled', this.state.node);
        (this as any).setStateDirty();
    }

    public nodeClicked(event: any): void {
        if (this.state.node.expandOnClick) {
            this.toggleNode(event);
        }

        if (this.state.node.selectable) {
            (this as any).emit('nodeClicked', this.state.node);
        }
    }

    public nodeHovered(): void {
        if (!this.isNodeActive()) {
            (this as any).emit('nodeHovered', this.state.node);
        }
    }

    public childNodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

    public childNodeToggled(node: TreeNode): void {
        (this as any).emit('nodeToggled', node);
    }

    public childNodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

}

module.exports = TreeNodeComponent;
