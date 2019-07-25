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

export class TreeNavigationUtil {

    public static navigateDown(tree: TreeNode[]) {
        const navigationNode = TreeNavigationUtil.findNavigationNode(tree);
        if (navigationNode) {
            navigationNode.navigationNode = false;
            if (navigationNode.nextNode) {
                navigationNode.nextNode.navigationNode = true;
            }
        } else if (tree.length) {
            tree[0].navigationNode = true;
        }
    }

    public static navigateUp(tree: TreeNode[]) {
        const navigationNode = TreeNavigationUtil.findNavigationNode(tree);
        if (navigationNode) {
            navigationNode.navigationNode = false;
            if (navigationNode.previousNode) {
                navigationNode.previousNode.navigationNode = true;
            }
        } else if (tree.length) {
            tree[tree.length - 1].navigationNode = true;
        }
    }

    public static toggleNode(tree: TreeNode[], expand: boolean, filterValue: string) {
        const navigationNode = TreeNavigationUtil.findNavigationNode(tree);
        if (navigationNode) {
            navigationNode.expanded = expand;
        }

        TreeUtil.linkTreeNodes(tree, filterValue);
    }

    public static setNavigationNode(tree: TreeNode[], node: TreeNode): void {
        const navigationNode = TreeNavigationUtil.findNavigationNode(tree);
        if (navigationNode) {
            navigationNode.navigationNode = false;
        }

        const newNavigationNode = TreeUtil.findNode(tree, node.id);
        if (newNavigationNode) {
            newNavigationNode.navigationNode = true;
        }
    }

    public static findNavigationNode(tree: TreeNode[]): TreeNode {
        if (tree) {
            for (const node of tree) {
                if (node.navigationNode) {
                    return node;
                } else {
                    const foundChild = TreeNavigationUtil.findNavigationNode(node.children);
                    if (foundChild) {
                        return foundChild;
                    }
                }
            }
        }
    }


}
