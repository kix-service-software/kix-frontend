import { TreeNode } from "@kix/core/dist/model";

export class TreeUtil {

    public static cloneTree(tree: TreeNode[]): TreeNode[] {
        const newTree = [];
        if (tree) {
            for (const node of tree) {
                const newNode = new TreeNode(
                    node.id, node.label, node.icon, this.cloneTree(node.children), node.properties, node.expanded
                );
                newTree.push(newNode);
            }
        }
        return newTree;
    }

    public static buildTree(nodes: TreeNode[], filterValue: string, expandNodes: boolean = false): TreeNode[] {
        const displayTree = [];

        if (nodes) {
            for (const node of nodes) {
                node.children = TreeUtil.buildTree([...node.children], filterValue, expandNodes);
                if (node.children.length || this.checkNodeLabel(node.label, filterValue)) {
                    node.expanded = expandNodes;
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

}
