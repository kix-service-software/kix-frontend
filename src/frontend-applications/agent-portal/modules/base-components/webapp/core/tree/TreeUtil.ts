/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from '.';

export class TreeUtil {

    public static linkTreeNodes(
        tree: TreeNode[], filterValue: string, parent?: TreeNode,
        linkNodes: boolean = true, setParentFlags: boolean = true
    ): void {
        if (tree) {
            tree = tree.filter((n) => n instanceof TreeNode);
            this.setNodesVisible(tree);
            TreeUtil.removeNodeLinks(tree);
            TreeUtil.setNodeFlags(tree, null, setParentFlags);
            let previousNode;
            for (let i = 0; i < tree.length; i++) {
                const node = tree[i];

                const hasChildrenToShow = TreeUtil.hasChildrenToShow(node, filterValue);
                if (TreeUtil.isNodeVisible(node, filterValue, hasChildrenToShow)) {
                    node.visible = true;

                    if (TreeUtil.isFilterValueDefined(filterValue) && hasChildrenToShow) {
                        node.expanded = true;
                    }

                    node.parent = parent;
                    node.nextNode = TreeUtil.getNextVisibleNode(tree, (i + 1), filterValue);

                    if (previousNode) {
                        node.previousNode = previousNode;

                        if (previousNode.expanded && TreeUtil.hasChildrenToShow(previousNode, filterValue)) {
                            node.previousNode = TreeUtil.getLastVisibleNode(previousNode.children, filterValue);
                        } else {
                            previousNode.nextNode = node;
                        }
                    } else if (i === 0) {
                        node.previousNode = parent;
                    }

                    if (i === tree.length - 1 && !node.expanded) {
                        node.nextNode = TreeUtil.getNextParentNode(node.parent);
                    }

                    if (node.expanded && hasChildrenToShow) {
                        TreeUtil.linkTreeNodes(node.children, filterValue, node, linkNodes, setParentFlags);
                        node.nextNode = TreeUtil.getFirstVisibleNode(node.children, filterValue);
                    }

                    previousNode = node;
                } else {
                    TreeUtil.setNodesVisible([node], false);
                }
            }
        }
    }

    private static setNodesVisible(nodes: TreeNode[], visible: boolean = true): void {
        if (nodes) {
            nodes.forEach((n) => {
                n.visible = visible;
                if (!visible) {
                    n.navigationNode = false;
                }

                if (n.children && n.children.length) {
                    TreeUtil.setNodesVisible(n.children, visible);
                }
            });
        }
    }

    private static removeNodeLinks(tree: TreeNode[]): void {
        for (const node of tree) {
            node.previousNode = null;
            node.nextNode = null;
            node.parent = null;
        }
    }

    private static getNextParentNode(parent: TreeNode): TreeNode {
        let nextNode = parent ? parent.nextNode : null;

        if (!nextNode && parent && parent.parent) {
            nextNode = TreeUtil.getNextParentNode(parent.parent);
        }

        return nextNode;
    }

    public static getFirstVisibleNode(tree: TreeNode[], filterValue: string): TreeNode {
        if (tree) {
            for (const node of tree) {
                if (node.visible) {
                    return node;
                }
            }
        }
        return null;
    }

    public static getLastVisibleNode(tree: TreeNode[], filterValue: string): TreeNode {
        if (tree) {
            for (let i = tree.length - 1; i >= 0; i--) {
                const node = tree[i];
                if (node && node.expanded && TreeUtil.isNodeVisible(node, filterValue)) {
                    return TreeUtil.getLastVisibleNode(node.children, filterValue);
                } else {
                    return node;
                }
            }
        }
        return null;
    }

    private static getNextVisibleNode(tree: TreeNode[], index: number, filterValue: string): TreeNode {
        for (let i = index; i < tree.length; i++) {
            if (TreeUtil.isNodeVisible(tree[i], filterValue)) {
                return tree[i];
            }
        }
        return null;
    }

    public static isNodeVisible(
        node: TreeNode, filterValue: string, hasChildrenToShow?: boolean
    ): boolean {
        let canShow = true;
        if (TreeUtil.isFilterValueDefined(filterValue)) {
            hasChildrenToShow = (typeof hasChildrenToShow !== 'undefined' && hasChildrenToShow);
            if (!hasChildrenToShow && !TreeUtil.hasChildrenToShow(node, filterValue)) {
                const flags = node.flags
                    .filter((f) => f !== null && f !== undefined)
                    .map((f) => f.toLocaleUpperCase());
                canShow = flags.some((f) => f.toLocaleLowerCase().indexOf(filterValue.toLocaleLowerCase()) !== -1);
            }
        }
        return canShow;
    }

    public static findNode(tree: TreeNode[], nodeId: string | number, searchValue?: string): TreeNode {
        if (Array.isArray(tree)) {
            for (const node of tree) {
                if (typeof nodeId !== 'undefined' && nodeId !== null && node.id?.toString() === nodeId.toString()) {
                    return node;
                } else if (
                    searchValue &&
                    (
                        node.flags.some((f) => f === searchValue) ||
                        node.label === searchValue ||
                        node.id === searchValue
                    )
                ) {
                    return node;
                } else {
                    const foundChild = TreeUtil.findNode(node.children, nodeId, searchValue);
                    if (foundChild) {
                        return foundChild;
                    }
                }
            }
        }

        return null;
    }

    public static hasChildrenToShow(node: TreeNode, filterValue: string): boolean {
        if (node.children) {
            for (const child of node.children) {
                if (TreeUtil.isNodeVisible(child, filterValue)) {
                    return true;
                }
            }
        }
        return false;
    }

    private static isFilterValueDefined(filterValue: string): boolean {
        return filterValue && filterValue !== undefined && filterValue !== null && filterValue !== '';
    }

    private static setNodeFlags(tree: TreeNode[], parent?: TreeNode, setParentFlags: boolean = true): void {
        if (tree) {
            tree.forEach((n) => {
                if (!n.flags) {
                    n.flags = [n.label];
                } else if (!n.flags.some((f) => f === n.label)) {
                    n.flags.push(n.label);
                }

                if (setParentFlags && parent && parent.flags) {
                    parent.flags
                        .filter((f) => !n.flags.some((nf) => nf === f))
                        .forEach((f) => n.flags.push(f));
                }

                if (n.children && n.children.length) {
                    TreeUtil.setNodeFlags(n.children, n, setParentFlags);
                }
            });
        }
    }

    public static getSelectedNodes(tree: TreeNode[]): TreeNode[] {
        let nodes = [];

        if (tree) {
            tree.forEach((n) => {
                if (n.selected) {
                    nodes.push(n);
                }

                if (n.children && n.children.length) {
                    nodes = [...nodes, ...TreeUtil.getSelectedNodes(n.children)];
                }
            });
        }

        return nodes;
    }

    public static getVisibleNodes(tree: TreeNode[], filterValue: string): TreeNode[] {
        let nodes = [];

        if (tree) {
            tree.forEach((n) => {
                if (n.visible) {
                    nodes.push(n);
                }

                if (TreeUtil.hasChildrenToShow(n, filterValue)) {
                    nodes = [...nodes, ...TreeUtil.getVisibleNodes(n.children, filterValue)];
                }
            });
        }

        return nodes;
    }

    public static sortNodes(nodes: TreeNode[]): TreeNode[] {
        nodes.filter((n) => Array.isArray(n.children) && n.children.length)
            .forEach((n) => this.sortNodes(n.children));

        return nodes.sort((a, b) => {
            if (a.flags.some((f) => f === 'MODULE') && !b.flags.some((f) => f === 'MODULE')) {
                return -1;
            } else if (!a.flags.some((f) => f === 'MODULE') && b.flags.some((f) => f === 'MODULE')) {
                return 1;
            } else {
                return a.label.localeCompare(b.label);
            }
        });
    }

    public static sortTree(tree: TreeNode[]): void {
        tree.sort((a, b) => a.label.localeCompare(b.label));
        for (const n of tree) {
            if (n.children?.length) {
                this.sortTree(n.children);
            }
        }
    }

}
