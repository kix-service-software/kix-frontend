import { TreeNode } from "@kix/core/dist/model";
import { TreeComponentState } from "./TreeComponentState";

export class TreeUtil {

    public static linkTreeNodes(tree: TreeNode[], filterValue: string, parent?: TreeNode): void {
        if (tree) {
            TreeUtil.removeNodeLinks(tree);
            for (let i = 0; i < tree.length; i++) {
                const node = tree[i];

                if (TreeUtil.isNodeVisible(node, filterValue)) {
                    node.visible = true;

                    if (TreeUtil.isFilterValueDefined(filterValue)) {
                        node.expanded = true;
                    }

                    node.parent = parent;
                    node.nextNode = tree[i + 1];

                    if (i > 0) {
                        const previousNode = tree[i - 1];
                        node.previousNode = previousNode;
                        if (previousNode && !previousNode.expanded) {
                            previousNode.nextNode = node;
                        }
                    } else if (i === 0) {
                        node.previousNode = parent;
                    }

                    if (i === tree.length - 1 && !node.expanded) {
                        node.nextNode = TreeUtil.getNextParentNode(node.parent);
                    }

                    if (node.expanded) {
                        TreeUtil.linkTreeNodes(node.children, filterValue, node);
                        node.nextNode = TreeUtil.getFirstVisibleNode(node.children, filterValue);
                    }
                } else {
                    node.visible = false;
                }
            }
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
        for (const node of tree) {
            if (node.visible) {
                return node;
            }
        }
        return null;
    }

    public static getLastVisibleNode(tree: TreeNode[], filterValue: string): TreeNode {
        for (let i = tree.length - 1; i >= 0; i--) {
            const node = tree[i];
            if (node && node.visible) {
                return node;
            }
        }
        return null;
    }

    public static isNodeVisible(node: TreeNode, filterValue: string): boolean {
        let canShow = true;
        if (TreeUtil.isFilterValueDefined(filterValue)) {
            if (!TreeUtil.hasChildrenToShow(node, filterValue)) {
                const label = node.label.toLocaleLowerCase();
                canShow = label.indexOf(filterValue.toLocaleLowerCase()) !== -1;
            }
        }
        return canShow;
    }

    private static hasChildrenToShow(node: TreeNode, filterValue: string): boolean {
        for (const child of node.children) {
            if (TreeUtil.isNodeVisible(child, filterValue)) {
                return true;
            }
        }
        return false;
    }

    private static isFilterValueDefined(filterValue: string): boolean {
        return filterValue && filterValue !== undefined && filterValue !== null && filterValue !== '';
    }

}
