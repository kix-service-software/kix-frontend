/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from './TreeNode';
import { TreeUtil } from './TreeUtil';
import { TreeNavigationHandler } from './TreeNavigationHandler';
import { SortUtil } from '../../../../../model/SortUtil';

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
        this.setTree(this.tree, this.filterValue, true);
    }

    public handleKeyEvent(event: any): void {
        if (this.active) {
            switch (event.key) {
                case 'a':
                    if (!this.multiselect) {
                        event = { ...event, ctrlKey: false, key: event.key, shiftKey: false };
                    }
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
                    if (!event.ctrlKey) {
                        this.selectNavigationNode();
                        this.finishListener.forEach((l) => l());
                        if (event.preventDefault && event.stopPropagation) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                    break;
                case 'Escape':
                    this.finishListener.forEach((l) => l());
                    if (event.preventDefault && event.stopPropagation) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    break;
                default:
                    if (!this.multiselect) {
                        event = { ...event, ctrlKey: false, key: event.key, shiftKey: false };
                    }
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

    public setTree(tree: TreeNode[], filterValue?: string, keepSelection?: boolean, filterSelection?: boolean): void {
        this.tree = tree?.filter((n) => n !== null && typeof n !== 'undefined');
        if (!keepSelection) {
            this.selectedNodes = [];
        }

        TreeUtil.linkTreeNodes(this.tree, filterValue);
        this.navigationHandler.setTree(this.tree);

        for (const n of this.selectedNodes) {
            const node = TreeUtil.findNode(this.tree, n.id);
            if (node) {
                node.selected = true;
            }
        }
        const treeSelection = this.getSelection(this.tree);
        this.setSelection(treeSelection, true, true, true, filterSelection);

        this.listener.forEach((l) => l(this.tree));
    }

    public getTree(): TreeNode[] {
        return this.tree || [];
    }

    public getTreeLength(tree: TreeNode[] = this.tree): number {
        let length = 0;
        if (Array.isArray(tree)) {
            tree.forEach((tn) => {
                length++;
                if (tn.children) {
                    length += this.getTreeLength(tn.children);
                }
            });
        }
        return length;
    }

    public setSelection(
        nodes: TreeNode[], selected: boolean = true, silent: boolean = false, force: boolean = false,
        filterSelection?: boolean
    ): void {
        if (nodes) {

            nodes = nodes.filter((n) => n !== null && typeof n !== 'undefined');

            let selectionChanged = true;
            if (nodes.length) {
                if (this.multiselect) {
                    nodes.forEach((n) => {
                        this.setSelectedNode(n.id, selected);
                    });
                } else {
                    const selectedNode = this.selectedNodes.find((n) => n.id === nodes[0].id);

                    if (selectedNode && !force) {
                        silent = true;
                        selectionChanged = false;
                    } else {
                        this.selectedNodes.forEach((n) => n.selected = false);
                        this.selectedNodes = [];
                        this.setSelectedNode(nodes[0].id, selected);
                    }

                }

                if (selectionChanged) {
                    this.tidyUpSelectedNodes(nodes, selected);
                }
            } else if (selected && filterSelection) {
                this.selectedNodes = [];
            }

            if (filterSelection) {
                const selection = [];
                this.selectedNodes.forEach((n) => {
                    const exists = selection.some((sn) => sn.id === n.id);
                    if (filterSelection && !exists) {
                        const existingNode = TreeUtil.findNode(this.tree, n.id);
                        if (existingNode) {
                            selection.push(n);
                        } else {
                            n.selected = false;
                        }
                    } else if (!exists) {
                        selection.push(n);
                    }
                });
                this.selectedNodes = selection;
            }

            // sort to keep always same order (is important in report jobs (output formats))
            this.selectedNodes = SortUtil.sortObjects(this.selectedNodes, 'label');

            this.listener.forEach((l) => l(this.getSelectedNodes()));
            if (!silent) {
                this.selectionListener.forEach((l) => l(this.getSelectedNodes()));
            }
        } else if (this.selectedNodes?.length) {
            this.selectedNodes = [];
            this.listener.forEach((l) => l(this.getSelectedNodes()));
            if (!silent) {
                this.selectionListener.forEach((l) => l(this.getSelectedNodes()));
            }
        }
    }

    public expandSelection(tree: TreeNode[] = this.tree): boolean {
        let expand = false;
        for (const node of tree) {
            if (node.children) {
                const childSelected = this.expandSelection(node.children);
                if (childSelected) {
                    node.expanded = true;
                    expand = true;
                }
            }

            if (node.selected) {
                expand = true;
            }
        }

        return expand;
    }

    private tidyUpSelectedNodes(nodes: TreeNode[], selected: boolean): void {
        nodes.forEach((n) => {
            const nodeIndex = this.selectedNodes.findIndex(
                (ftn) => ftn?.id?.toString() === n?.id?.toString()
            );
            if (nodeIndex === -1 && selected) {
                n.selected = true;
                this.selectedNodes.push(n);
            } else if (nodeIndex !== -1 && !selected) {
                this.selectedNodes.splice(nodeIndex, 1);
            }
        });
    }

    private setSelectedNode(nodeId: number | string, selected: boolean): void {
        const node = TreeUtil.findNode(this.tree, nodeId);
        if (node) {
            node.selected = selected;
            if (selected && !this.selectedNodes.some((sn) => sn.id === nodeId)) {
                this.selectedNodes.push(node);
            }
        }
    }

    public selectAll(): void {
        const nodes = TreeUtil.getVisibleNodes(this.tree, this.filterValue);
        this.setSelection(nodes, true);
    }

    public selectNone(silent: boolean = false): void {
        const nodes = TreeUtil.getVisibleNodes(this.tree, this.filterValue);
        for (const n of nodes) {
            this.setSelectedNode(n.id, false);
        }
        this.selectedNodes = [];

        this.listener.forEach((l) => l(this.getSelectedNodes()));
        if (!silent) {
            this.selectionListener.forEach((l) => l(this.getSelectedNodes()));
        }
    }

    public getSelectedNodes(): TreeNode[] {
        return [...this.selectedNodes];
    }

    public getSelection(tree: TreeNode[]): TreeNode[] {
        let selection: TreeNode[] = [];

        if (tree) {
            tree.forEach((n) => {
                if (n.selected) {
                    selection.push(n);
                }

                if (n.children && n.children.length) {
                    selection = [...selection, ...this.getSelection(n.children)];
                }

            });
        }

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
