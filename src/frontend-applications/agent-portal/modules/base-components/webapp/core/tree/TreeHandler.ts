/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from "./TreeNode";
import { TreeUtil } from "./TreeUtil";
import { TreeNavigationHandler } from "./TreeNavigationHandler";

export class TreeHandler {

    private keyListener: (event: any) => void;
    public navigationHandler: TreeNavigationHandler;

    private listener: Map<string, (nodes: TreeNode[]) => void> = new Map();
    private selectionListener: Map<string, (nodes: TreeNode[]) => void> = new Map();
    private finishListener: Map<string, () => void> = new Map();

    private selectedNodes: TreeNode[] = [];

    public active: boolean = true;

    public constructor(
        private tree: TreeNode[] = [],
        private keyListenerElement?: any,
        private filterValue?: string,
        private multiselect: boolean = true
    ) {
        this.navigationHandler = new TreeNavigationHandler();
        this.setTree(this.tree, this.filterValue);
        this.registerKeyListener();
    }

    public setKeyListenerElement(element: any): void {
        this.keyListenerElement = element;
        this.registerKeyListener();
    }

    public setMultiSelect(multiselect: boolean = true): void {
        this.multiselect = multiselect;
    }

    private registerKeyListener(): void {
        if (this.keyListenerElement) {
            this.keyListener = this.handleKeyEvent.bind(this);
            this.keyListenerElement.addEventListener('keydown', this.keyListener);
        }
    }

    public registerFinishListener(listenerId: string, listener: () => void): void {
        this.finishListener.set(listenerId, listener);
    }

    public registerListener(listenerId: string, listener: (nodes: TreeNode[]) => void): void {
        this.listener.set(listenerId, listener);
    }

    public registerSelectionListener(listenerId: string, listener: (nodes: TreeNode[]) => void): void {
        this.selectionListener.set(listenerId, listener);
    }

    public toggleNode(node: TreeNode): void {
        node.expanded = !node.expanded;
        TreeUtil.linkTreeNodes(this.tree, this.filterValue);
        this.navigationHandler.setTree(this.tree);
        this.listener.forEach((l) => l([node]));
    }

    public filter(filterValue: string): void {
        this.filterValue = filterValue;
        this.setTree(this.tree, this.filterValue);
    }

    public handleKeyEvent(event: any): void {
        if (this.active) {
            if (!this.multiselect) {
                event = {
                    ...event,
                    ctrlKey: false,
                    key: event.key,
                    shiftKey: false
                };
            }

            switch (event.key) {
                case 'a':
                    if (event.ctrlKey) {
                        if (event.preventDefault && event.stopPropagation) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        this.selectAll();
                    }
                    break;
                case 'Enter':
                    if (event.preventDefault && event.stopPropagation) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    this.selectNavigationNode(true);
                    this.finishListener.forEach((l) => l());
                    break;
                case ' ':
                    this.selectNavigationNode();
                    break;
                case 'Tab':
                    this.selectNavigationNode();
                    this.finishListener.forEach((l) => l());
                    break;
                case 'Escape':
                    this.finishListener.forEach((l) => l());
                    break;
                default:
                    const affectedNodes = this.navigationHandler.handleEvent(event, this.filterValue);
                    if (affectedNodes) {
                        affectedNodes.forEach((n) => {
                            const nodeIndex = this.selectedNodes.findIndex((ftn) => ftn.id === n.id);
                            if (nodeIndex === -1 && n.selected) {
                                this.selectedNodes.push(n);
                            } else if (nodeIndex !== -1 && !n.selected) {
                                this.selectedNodes.splice(nodeIndex, 1);
                            }
                        });
                        this.listener.forEach((l) => l(affectedNodes));
                    }
            }
            this.updateSelection();
        }
    }

    private updateSelection(): void {
        const selectedNodes = TreeUtil.getSelectedNodes(this.tree);
        selectedNodes.forEach((n) => {
            if (!this.selectedNodes.some((sn) => sn.id === n.id)) {
                this.selectedNodes.push(n);
            }
        });
    }

    private selectNavigationNode(keepSelected?: boolean): void {
        const navigationNode = this.navigationHandler.findNavigationNode();
        if (navigationNode) {
            if (navigationNode.selected && !keepSelected) {
                this.setSelection([navigationNode], false, false, true);
            } else {
                this.setSelection([navigationNode], true, false, true);
            }
            this.listener.forEach((l) => l([navigationNode]));
        }
    }

    public setTree(tree: TreeNode[], filterValue?: string, keepSelection?: boolean): void {
        this.tree = tree;
        if (!keepSelection) {
            this.selectedNodes = [];
        }

        TreeUtil.linkTreeNodes(tree, filterValue);
        this.navigationHandler.setTree(tree);

        const preselectedNodes = [];
        this.selectedNodes.forEach((n) => {
            const node = TreeUtil.findNode(tree, n.id);
            if (node) {
                node.selected = true;
            }
        });
        const treeSelection = this.getSelection(tree);
        this.setSelection(treeSelection, true, true, true);

        this.listener.forEach((l) => l(tree));
    }

    public getTree(): TreeNode[] {
        return this.tree;
    }

    public setSelection(
        nodes: TreeNode[], selected: boolean = true, silent: boolean = false, force: boolean = false
    ): void {
        if (nodes) {

            nodes = nodes.filter((n) => n !== null && typeof n !== 'undefined');

            let selectionChanged = true;
            if (!!nodes.length) {
                if (this.multiselect) {
                    nodes.forEach((n) => n.selected = selected);
                } else {
                    const selectedNode = this.selectedNodes.find((n) => n.id === nodes[0].id);

                    if (selectedNode && !force) {
                        silent = true;
                        selectionChanged = false;
                    } else {
                        this.selectedNodes.forEach((n) => n.selected = false);
                        this.selectedNodes = [];
                        const node = TreeUtil.findNode(this.tree, nodes[0].id);
                        if (node) {
                            node.selected = selected;
                            this.selectedNodes = [node];
                        }
                    }

                }

                if (selectionChanged) {
                    nodes.forEach((n) => {
                        const nodeIndex = this.selectedNodes.findIndex((ftn) => ftn.id === n.id);
                        if (nodeIndex === -1 && selected) {
                            this.selectedNodes.push(n);
                        } else if (nodeIndex !== -1 && !selected) {
                            this.selectedNodes.splice(nodeIndex, 1);
                        }
                    });
                    this.listener.forEach((l) => l(this.getSelectedNodes()));

                    if (!silent) {
                        this.selectionListener.forEach((l) => l(this.getSelectedNodes()));
                    }
                }
            }
        }
    }

    public selectAll(): void {
        const nodes = TreeUtil.getVisibleNodes(this.tree, this.filterValue);
        this.setSelection(nodes, true);
    }

    public selectNone(): void {
        const nodes = TreeUtil.getVisibleNodes(this.tree, this.filterValue);
        this.setSelection(nodes, false);
    }

    public getSelectedNodes(): TreeNode[] {
        return [...this.selectedNodes];
    }

    public getSelection(tree: TreeNode[]): TreeNode[] {
        let selection: TreeNode[] = [];

        tree.forEach((n) => {
            if (n.selected) {
                selection.push(n);
            }

            if (n.children && n.children.length) {
                selection = [...selection, ...this.getSelection(n.children)];
            }

        });

        return selection;
    }

    public getVisibleNodes(): TreeNode[] {
        return TreeUtil.getVisibleNodes(this.tree, this.filterValue);
    }

    public destroy(): void {
        if (this.keyListenerElement) {
            this.keyListenerElement.removeEventListener('keydown', this.navigationHandler);
        }
    }

}
