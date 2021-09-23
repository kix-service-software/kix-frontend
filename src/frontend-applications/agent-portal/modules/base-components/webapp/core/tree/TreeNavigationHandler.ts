/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from './TreeNode';
import { TreeUtil } from './TreeUtil';

export class TreeNavigationHandler {

    private tree: TreeNode[];
    private shiftSelection: boolean = false;
    private direction: string;
    private backwards: boolean = false;

    public setTree(tree: TreeNode[]): void {
        this.tree = tree;
    }

    public findNavigationNode(tree: TreeNode[] = this.tree): TreeNode {
        if (tree) {
            for (const node of tree) {
                if (node.navigationNode) {
                    if (!node.visible) {
                        node.navigationNode = false;
                    }
                    return node.navigationNode ? node : null;
                } else if (node.children && node.children.length) {
                    const foundChild = this.findNavigationNode(node.children);
                    if (foundChild) {
                        return foundChild;
                    }
                }
            }
        }
    }

    public setNavigationNode(node: TreeNode): void {
        const navigationNode = this.findNavigationNode(this.tree);
        if (navigationNode) {
            navigationNode.navigationNode = false;
        }

        const newNavigationNode = TreeUtil.findNode(this.tree, node.id);
        if (newNavigationNode) {
            newNavigationNode.navigationNode = true;
        }
    }

    public handleEvent(event: any, filterValue?: string): TreeNode[] {
        const navigationNode = this.findNavigationNode(this.tree);
        if (navigationNode && !navigationNode.visible) {
            navigationNode.navigationNode = false;
        }

        if (!this.shiftSelection) {
            this.direction = null;
        }

        switch (event.key) {
            case 'ArrowUp':
                return this.navigateUp(event.shiftKey);
            case 'ArrowDown':
                return this.navigateDown(event.shiftKey);
            case 'ArrowLeft':
                return this.collapseNode(filterValue);
            case 'ArrowRight':
                return this.expandNode(filterValue, event.shiftKey);
            case 'PageDown':
                return this.navigatePageDown(event.shiftKey);
            case 'PageUp':
                return this.navigatePageUp(event.shiftKey);
            case 'Home':
                return this.navigateToFirstNode(event.shiftKey);
            case 'End':
                return this.navigateToLastNode(event.shiftKey);
            default:
        }
    }

    private navigateDown(shiftSelection: boolean): TreeNode[] {
        if (shiftSelection && this.direction === 'UP') {
            this.backwards = !this.backwards;
        }
        this.direction = 'DOWN';

        const affectedNodes = [];

        const navigationNode = this.findNavigationNode(this.tree);
        if (navigationNode) {
            if (navigationNode.nextNode) {
                navigationNode.navigationNode = false;
                navigationNode.nextNode.navigationNode = true;

                affectedNodes.push(navigationNode);
                affectedNodes.push(navigationNode.nextNode);

                if (shiftSelection) {
                    if (this.backwards) {
                        navigationNode.selected = !navigationNode.nextNode.selected;
                    } else {
                        navigationNode.nextNode.selected = !navigationNode.nextNode.selected;
                    }
                }

                if (shiftSelection && !this.shiftSelection) {
                    navigationNode.selected = !navigationNode.selected;
                }
            }
        } else {
            const firstNode = this.getFirstVisibleNode();
            if (firstNode) {
                firstNode.navigationNode = true;
                if (shiftSelection) {
                    firstNode.selected = true;
                    this.shiftSelection = true;
                }

                affectedNodes.push(firstNode);
            }
        }
        this.shiftSelection = shiftSelection;
        if (!shiftSelection) {
            this.backwards = false;
        }

        return affectedNodes;
    }

    private navigatePageDown(selection: boolean): TreeNode[] {
        let affectedNodes = [];
        for (let i = 0; i < 10; i++) {
            affectedNodes = [...affectedNodes, ...this.navigateDown(selection)];
        }
        return affectedNodes;
    }

    private navigateUp(shiftSelection: boolean): TreeNode[] {
        if (shiftSelection && this.direction === 'DOWN') {
            this.backwards = !this.backwards;
        }
        this.direction = 'UP';

        const affectedNodes = [];

        const navigationNode = this.findNavigationNode(this.tree);
        if (navigationNode) {
            if (navigationNode.previousNode) {
                navigationNode.navigationNode = false;
                navigationNode.previousNode.navigationNode = true;

                affectedNodes.push(navigationNode);
                affectedNodes.push(navigationNode.previousNode);

                if (shiftSelection) {
                    navigationNode.selected = !navigationNode.previousNode.selected;
                }
            } else if (this.shiftSelection) {
                navigationNode.selected = !navigationNode.selected;
                affectedNodes.push(navigationNode);
            }
        } else {
            const lastNode = this.getLastVisibleNode();
            if (lastNode) {
                lastNode.navigationNode = true;
                if (shiftSelection) {
                    this.shiftSelection = true;
                    lastNode.selected = true;
                    affectedNodes.push(lastNode);
                }
            }
        }
        this.shiftSelection = shiftSelection;
        if (!shiftSelection) {
            this.backwards = false;
        }

        return affectedNodes;
    }

    private navigatePageUp(selection: boolean): TreeNode[] {
        let affectedNodes = [];
        for (let i = 0; i < 10; i++) {
            affectedNodes = [...affectedNodes, ...this.navigateUp(selection)];
        }
        return affectedNodes;
    }

    public expandNode(filterValue: string, selection: boolean): TreeNode[] {
        let affectedNodes = [];
        const node = this.findNavigationNode(this.tree);
        if (node) {
            if (node.children && node.children.length > 0) {
                node.expanded = true;
                TreeUtil.linkTreeNodes(this.tree, filterValue);
                affectedNodes = this.navigateDown(selection);
            }
        }
        return affectedNodes;
    }

    public collapseNode(filterValue: string): TreeNode[] {
        const affectedNodes = [];
        const node = this.findNavigationNode(this.tree);
        if (node) {
            node.expanded = false;

            if (node.parent) {
                node.parent.expanded = false;
                node.parent.navigationNode = true;
                node.navigationNode = false;
                affectedNodes.push(node);
            }
            TreeUtil.linkTreeNodes(this.tree, filterValue);
        }

        return affectedNodes;
    }

    public navigateToFirstNode(shiftSelection: boolean): TreeNode[] {
        let affectedNodes = [];
        const firstNode = this.getFirstVisibleNode();
        if (firstNode) {
            let currentNavigationNode = this.findNavigationNode(this.tree);
            if (!currentNavigationNode) {
                affectedNodes = this.navigateDown(shiftSelection);
            } else {
                while (currentNavigationNode) {
                    affectedNodes = [
                        ...affectedNodes,
                        ...this.navigateUp(shiftSelection)
                    ];

                    if (currentNavigationNode.id === firstNode.id) {
                        break;
                    }

                    currentNavigationNode = this.findNavigationNode(this.tree);
                }
            }
        }
        return affectedNodes;
    }

    public navigateToLastNode(shiftSelection: boolean): TreeNode[] {
        let affectedNodes = [];
        const endNode = this.getLastVisibleNode();
        if (endNode) {
            let currentNavigationNode = this.findNavigationNode(this.tree);
            if (!currentNavigationNode) {
                affectedNodes = this.navigateDown(shiftSelection);
                currentNavigationNode = this.findNavigationNode(this.tree);
            }

            while (currentNavigationNode) {
                affectedNodes = [
                    ...affectedNodes,
                    ...this.navigateDown(shiftSelection)
                ];

                if (currentNavigationNode.id === endNode.id) {
                    break;
                }

                currentNavigationNode = this.findNavigationNode(this.tree);
            }
        }
        return affectedNodes;
    }

    public getFirstVisibleNode(): TreeNode {
        return this.tree.find((n) => n.visible);
    }

    public getLastVisibleNode(): TreeNode {
        let node = this.getFirstVisibleNode();
        if (node) {
            while (node.nextNode) {
                node = node.nextNode;
            }
        }
        return node;
    }

}
