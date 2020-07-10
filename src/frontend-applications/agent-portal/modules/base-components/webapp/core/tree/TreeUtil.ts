/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from '.';

export class TreeUtil {

    public static linkTreeNodes(tree: TreeNode[], filterValue: string, parent?: TreeNode): void {
        if (tree) {
            this.setNodesVisible(tree);
            TreeUtil.removeNodeLinks(tree);
            TreeUtil.setNodeFlags(tree);
            let previousNode;
            for (let i = 0; i < tree.length; i++) {
                const node = tree[i];

                if (TreeUtil.isNodeVisible(node, filterValue)) {
                    node.visible = true;

                    if (TreeUtil.isFilterValueDefined(filterValue) && TreeUtil.hasChildrenToShow(node, filterValue)) {
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

                    if (node.expanded && (TreeUtil.hasChildrenToShow(node, filterValue))) {
                        TreeUtil.linkTreeNodes(node.children, filterValue, node);
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

    public static isNodeVisible(node: TreeNode, filterValue: string): boolean {
        let canShow = true;
        if (TreeUtil.isFilterValueDefined(filterValue)) {
            if (!TreeUtil.hasChildrenToShow(node, filterValue)) {
                const flags = node.flags.map((f) => f.toLocaleUpperCase());
                canShow = flags.some((f) => f.toLocaleLowerCase().indexOf(filterValue.toLocaleLowerCase()) !== -1);
            }
        }
        return canShow;
    }

    public static findNode(tree: TreeNode[], nodeId: string | number): TreeNode {
        if (tree) {
            for (const node of tree) {
                if (node.id.toString() === nodeId.toString()) {
                    return node;
                } else {
                    const foundChild = TreeUtil.findNode(node.children, nodeId);
                    if (foundChild) {
                        return foundChild;
                    }
                }
            }
        }
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

    private static setNodeFlags(tree: TreeNode[], parent?: TreeNode): void {
        if (tree) {
            tree.forEach((n) => {
                if (!n.flags) {
                    n.flags = [n.label];
                } else if (!n.flags.some((f) => f === n.label)) {
                    n.flags.push(n.label);
                }

                if (parent && parent.flags) {
                    parent.flags.forEach((f) => n.flags.push(f));
                }

                if (n.children && n.children.length) {
                    TreeUtil.setNodeFlags(n.children, n);
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

}
