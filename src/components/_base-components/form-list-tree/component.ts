/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeUtil, TreeNode, TreeNavigationUtil } from '../../../core/model';
import { IdService } from '../../../core/browser/IdService';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class TreeComponent {

    private state: ComponentState;

    private containerElement: any;

    private navigationHandler: (event: any) => void;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.treeId = input.treeId ? input.treeId : 'tree-' + IdService.generateDateBasedId();
    }

    public onInput(input: any): void {
        this.update(input);

        if (input.containerElement && !this.containerElement) {

            this.navigationHandler = (event: any): void => {
                switch (event.key) {
                    case 'ArrowUp':
                        TreeNavigationUtil.navigateUp(this.state.nodes);
                        (this as any).setStateDirty();
                        break;
                    case 'ArrowDown':
                        TreeNavigationUtil.navigateDown(this.state.nodes);
                        (this as any).setStateDirty();
                        break;
                    case 'ArrowLeft':
                        TreeNavigationUtil.toggleNode(this.state.nodes, false, this.state.filterValue);
                        (this as any).setStateDirty();
                        break;
                    case 'ArrowRight':
                        TreeNavigationUtil.toggleNode(this.state.nodes, true, this.state.filterValue);
                        (this as any).setStateDirty();
                        break;
                    case 'Enter':
                        const navigationNode = TreeNavigationUtil.findNavigationNode(this.state.nodes);
                        if (navigationNode) {
                            this.nodeClicked(navigationNode);
                        }
                        break;
                    default:
                }
            };

            this.containerElement = input.containerElement;
            this.containerElement.addEventListener('keydown', this.navigationHandler);
        }
    }

    public onDestroy(): void {
        if (this.containerElement) {
            this.containerElement.removeEventListener('keydown', this.navigationHandler);
            this.containerElement = null;
        }
    }

    private async update(input: any): Promise<void> {
        if (input.nodes && Array.isArray(input.nodes)) {
            for (const n of input.nodes) {
                (n as TreeNode).label = await TranslationService.translate(n.label, []);
            }
        }
        this.state.nodes = input.nodes;
        this.state.filterValue = input.filterValue;
        TreeUtil.linkTreeNodes(this.state.nodes, this.state.filterValue);

        this.state.activeNodes = input.activeNodes ?
            (input.activeNodes as TreeNode[]).filter((an) => an.clickable) : [];
        (this as any).setStateDirty('activeNodes');
        this.state.treeStyle = input.treeStyle;
    }

    public nodeToggled(node: TreeNode): void {
        TreeUtil.linkTreeNodes(this.state.nodes, this.state.filterValue);
        (this as any).emit('nodeToggled', node);
    }

    public nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    public nodeHovered(node: TreeNode): void {
        TreeNavigationUtil.setNavigationNode(this.state.nodes, node);
        (this as any).setStateDirty();
    }

    public getFilteredNodes(): any {
        return this.state.nodes.filter((n) => n.visible);
    }
}

module.exports = TreeComponent;
