import { TreeNode } from "@kix/core/dist/model";
import { TreeComponentState } from "./TreeComponentState";

export class TreeUtil {

    public static cloneTree(parent: TreeNode, tree: TreeNode[], activeNode: TreeNode): TreeNode[] {
        const newTree = [];
        if (tree) {
            let previousNode: TreeNode = null;
            for (const node of tree) {

                const newNode = new TreeNode(
                    node.id,
                    node.label,
                    node.icon,
                    node.secondaryIcon,
                    this.cloneTree(node, node.children, activeNode),
                    parent,
                    null,
                    null,
                    node.properties,
                    node.expanded,
                    node.active
                );

                if (activeNode && activeNode.id === newNode.id) {
                    newNode.active = activeNode.active;
                    newNode.expanded = activeNode.expanded;
                } else {
                    newNode.active = false;
                }

                newTree.push(newNode);

                if (previousNode) {
                    newNode.previousNode = previousNode;
                    previousNode.nextNode = newNode;
                }

                previousNode = newNode;
            }
        }
        return newTree;
    }

    public static buildTree(
        nodes: TreeNode[], filterValue: string, expandNodes: boolean = false
    ): TreeNode[] {
        const displayTree = [];

        if (nodes) {
            for (const node of nodes) {
                node.children = TreeUtil.buildTree([...node.children], filterValue, expandNodes);
                if (node.children.length || this.checkNodeLabel(node.label, filterValue)) {
                    if (expandNodes) {
                        node.expanded = true;
                    }
                    displayTree.push(node);
                }
            }
        }

        return displayTree;
    }

    private static checkNodeLabel(label: string, filterValue: string): boolean {
        let match = true;

        if (filterValue && filterValue !== '') {
            match = label.toLocaleLowerCase().indexOf(filterValue.toLocaleLowerCase()) !== -1;
        }

        return match;
    }

    public static navigateDown(currentNode: TreeNode, tree: TreeNode[]): TreeNode {
        let activeNode = currentNode;
        if (!currentNode && tree.length) {
            activeNode = tree[0];
        } else {
            currentNode.active = false;
            if (currentNode.expanded) {
                activeNode = currentNode.children[0];
            } else if (currentNode.nextNode) {
                activeNode = currentNode.nextNode;
            } else if (currentNode.parent && currentNode.parent.nextNode) {
                activeNode = currentNode.parent.nextNode;
            }
        }

        activeNode.active = true;
        return activeNode;
    }

    public static navigateUp(currentNode: TreeNode, tree: TreeNode[]): TreeNode {
        let activeNode = currentNode;
        if (currentNode) {
            currentNode.active = false;

            if (currentNode.previousNode) {
                if (currentNode.previousNode.expanded) {
                    activeNode = currentNode.previousNode.children[currentNode.previousNode.children.length - 1];
                } else {
                    activeNode = currentNode.previousNode;
                }
            } else if (currentNode.parent) {
                activeNode = currentNode.parent;
            }
        }

        activeNode.active = true;
        return activeNode;
    }

    public static findNode(treeNode: TreeNode, tree: TreeNode[]): TreeNode {
        let foundNode = null;
        for (const node of tree) {
            if (node.id === treeNode.id) {
                foundNode = node;
            } else if (node.children) {
                foundNode = TreeUtil.findNode(treeNode, node.children);
            }

            if (foundNode) {
                break;
            }
        }

        return foundNode;
    }

    public static isNodeVisible(node: TreeNode, filterValue: string): boolean {
        let canShow = true;
        if (filterValue && filterValue !== '') {
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

}
