/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeNode } from '../../../../core/model';
import { BrowserUtil } from '../../../../core/browser';

class TreeNodeComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
        this.state.filterValue = input.filterValue;
        this.state.activeNodes = input.activeNodes;
        (this as any).setStateDirty('activeNodes');
        this.state.treeId = input.treeId;
        this.state.nodeId = this.state.treeId + '-node-' + this.state.node.id;
    }

    public onUpdate(): void {
        const element = (this as any).getEl(this.state.nodeId);
        if (element && this.state.node.navigationNode) {
            BrowserUtil.scrollIntoViewIfNeeded(element);
        }
    }

    public onDestroy(): void {
        this.state.node = null;
        this.state.filterValue = null;
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

    public toggleNode(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).emit('nodeToggled', this.state.node);
        (this as any).setStateDirty();
    }

    public nodeClicked(): void {
        if (this.state.node.clickable) {
            (this as any).emit('nodeClicked', this.state.node);
        }
    }

    public nodeHovered(): void {
        (this as any).emit('nodeHovered', this.state.node);
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

    public isNodeActive(): boolean {
        return this.state.activeNodes && this.state.activeNodes.some((n) => n.id === this.state.node.id);
    }
}

module.exports = TreeNodeComponent;
