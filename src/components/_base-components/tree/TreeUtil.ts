import { TreeNode } from "@kix/core/dist/model";
import { TreeComponentState } from "./TreeComponentState";

export class TreeUtil {

    public static linkTreeNodes(tree: TreeNode[], filterValue: string, parent?: TreeNode): void {
        if (tree) {
            let previousNode: TreeNode = null;
            for (const node of tree) {

                if (TreeUtil.isNodeVisible(node, filterValue)) {

                    node.visible = true;

                    if (TreeUtil.isFilterValueDefined(filterValue)) {
                        node.expanded = true;
                    }

                    if (previousNode) {
                        node.previousNode = previousNode;
                        previousNode.nextNode = node;
                    }

                    node.parent = parent;
                    previousNode = node;
                    if (node.expanded) {
                        TreeUtil.linkTreeNodes(node.children, filterValue, node);
                    }
                } else {
                    node.visible = false;
                }
            }
        }
    }

    public static linkParents(tree: TreeNode[], filterValue: string, parent?: TreeNode): void {
        if (tree.length && parent) {
            const firstNode = TreeUtil.getFirstVisibleNode(tree, filterValue);
            const lastNode = tree[tree.length - 1];

            firstNode.previousNode = parent;

            const nextParent = TreeUtil.getNextParentNode(parent);
            lastNode.nextNode = nextParent;
            if (nextParent) {
                nextParent.previousNode = lastNode;
            }

            if (parent.expanded) {
                parent.nextNode = firstNode;
            }
        }

        for (const node of tree) {
            if (node.visible && node.expanded) {
                TreeUtil.linkParents(node.children, filterValue, node);
            }
        }
    }

    private static getNextParentNode(parent: TreeNode): TreeNode {
        let nextNode = parent.nextNode;

        if (!nextNode && parent.parent) {
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
