/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeHandler, TreeService, TreeNode } from '../../core/tree';
import { ComponentInput } from './ComponentInput';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {
    private keepExpanded: boolean = false;
    private toggleButtonClicked: boolean = false;
    private treeHandler: TreeHandler;
    private removeTreeHandler: boolean = false;

    private toggleTimeout: any;
    private reposition?: () => void;

    public getTreeHandler(): TreeHandler {
        return this.treeHandler;
    }

    public onCreate(input: any): void {
        super.onCreate(input, 'form-list');
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        super.onInput(input);
        this.state.treeId = typeof input.treeId !== 'undefined' ? input.treeId : this.state.treeId;
        this.state.loadNodes = input.loadNodes;
        this.state.disabled = typeof input.disabled !== 'undefined' ? input.disabled : false;
        this.state.readonly = typeof input.readonly !== 'undefined' ? input.readonly : false;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
        this.state.multiselect = typeof input.multiselect !== 'undefined' ? input.multiselect : false;

        const canRemove = typeof input.canRemoveNode !== 'undefined' ? input.canRemoveNode : true;
        this.state.removeOnClose = typeof input.removeOnClose !== 'undefined' ? input.removeOnClose : false;
        this.state.removeNodes = canRemove && !this.state.readonly;
        this.state.actions = typeof input.actions !== 'undefined' ? input.actions : [];
        if (input.expanded) {
            this.state.expanded = true;
        }

        this.update(input);
    }

    private async update(input: any): Promise<void> {
        this.state.placeholder = await TranslationService.translate(input.placeholder);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const containerElement = (this as any).getEl(this.state.listId);

        this.treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (this.treeHandler) {
            this.treeHandler.setKeyListenerElement(containerElement);
        } else {
            this.treeHandler = new TreeHandler([], containerElement, null, this.state.multiselect);
            TreeService.getInstance().registerTreeHandler(this.state.treeId, this.treeHandler);
            this.removeTreeHandler = true;
        }

        document.addEventListener('click', this.checkExpandState.bind(this));

        if (this.state.loadNodes) {
            const nodes = await this.state.loadNodes();
            this.treeHandler.setTree(nodes);
            this.treeHandler.active = false;
        }

        this.treeHandler.registerFinishListener(this.state.treeId, () => this.toggleList(true));

        this.treeHandler.registerSelectionListener(this.state.treeId + '-selection', (nodes: TreeNode[]) => {
            if (!this.state.multiselect && nodes.length > 0 && this.state.expanded) {
                this.toggleList(true);
            }
            (this as any).emit('nodesChanged', nodes);
        });

        this.treeHandler.registerListener(this.state.treeId + '-listener', (_nodes: TreeNode[]) => {
            setTimeout(() => this.setDropdownStyle(), 100);
        });

        this.state.prepared = true;

        super.registerEventSubscriber(
            function (data): void {
                if (data !== this.state.treeId && this.state.expanded) {
                    this.toggleList(true, null, false);
                }
            },
            [ApplicationEvent.DROPDOWN_OPENED]
        );
    }

    public focus(event: any): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (!this.state.expanded) {
            this.toggleList(false);
        }
    }

    public onDestroy(): void {
        super.onDestroy();
        document.removeEventListener('click', this.checkExpandState.bind(this));
        if (this.reposition) {
            window.removeEventListener('scroll', this.reposition, true);
            window.removeEventListener('resize', this.reposition);
            this.reposition = undefined;
        }
        if (this.removeTreeHandler) {
            TreeService.getInstance().removeTreeHandler(this.state.treeId);
        }
    }

    private checkExpandState(): void {
        if (this.state.expanded) {
            if (this.keepExpanded) {
                this.keepExpanded = false;
            } else {
                this.toggleList();
            }
        }
    }

    public setKeepExpanded(event: any): void {
        if (!this.toggleButtonClicked) {
            this.keepExpanded = true;
        } else {
            this.toggleButtonClicked = false;
        }
    }

    public submitClicked(): void {
        this.toggleList(true);
    }

    private toggleList(close: boolean = true, event?: any, holdFocus: boolean = true): void {
        if (event) {
            this.toggleButtonClicked = true;
        }

        if (!this.toggleTimeout) {
            this.toggleTimeout = setTimeout(async () => {
                if (!this.state.disabled) {
                    if (this.state.expanded && close) {
                        this.state.expanded = false;
                        this.treeHandler.active = false;

                        if (this.reposition) {
                            window.removeEventListener('scroll', this.reposition, true);
                            window.removeEventListener('resize', this.reposition);
                            this.reposition = undefined;
                        }

                        const hiddenInput = (this as any).getEl('hidden-form-list-input');
                        if (hiddenInput && holdFocus) {
                            hiddenInput.focus();
                        }

                        (this as any).emit('nodesSubmitted', this.treeHandler.getSelectedNodes());

                        if (this.state.removeNodes && this.state.removeOnClose) {
                            this.treeHandler.selectNone();
                        }

                    } else if (!this.state.readonly) {
                        this.state.expanded = true;
                        this.treeHandler.active = true;
                        EventService.getInstance().publish(ApplicationEvent.DROPDOWN_OPENED, this.state.treeId);
                        setTimeout(() => {
                            this.setDropdownStyle();
                            if (!this.reposition) {
                                this.reposition = (): void => this.setDropdownStyle();
                                window.addEventListener('scroll', this.reposition, true);
                                window.addEventListener('resize', this.reposition);
                            }
                        }, 100);
                    }
                    this.toggleTimeout = null;
                }
            }, 75);

        }
    }

    private setDropdownStyle(): void {
        const valueList = (this as any).getEl('value-list-' + this.state.treeId) as HTMLElement | null;
        if (!valueList) { return; }

        const formListInputContainer =
            (this as any).getEl('form-list-input-container-' + this.state.listId) as HTMLElement | null;
        if (!formListInputContainer) { return; }

        const r = formListInputContainer.getBoundingClientRect();
        const vw = document.documentElement.clientWidth || window.innerWidth;
        const vh = document.documentElement.clientHeight || window.innerHeight;

        const maxDropdown = Math.min(vh * 0.5, 320);
        const naturalHeight = Math.max(0, valueList.scrollHeight || valueList.getBoundingClientRect().height || 0);
        const h = Math.min(naturalHeight || maxDropdown, maxDropdown);

        const spaceBelow = vh - r.bottom;
        const openAbove = spaceBelow < h && r.top > h;

        const gutter = 8;
        const seamOverlap = 1;
        const yGap = 2;

        let top: number;
        if (openAbove) {
            top = r.top - h + seamOverlap - yGap;
            top = Math.max(gutter, top);
        } else {
            top = r.bottom - seamOverlap + yGap;
            top = Math.min(vh - gutter - h, top);
        }

        const minWidth = Math.max(180, r.width);
        const left = Math.min(vw - gutter - minWidth, Math.max(gutter, r.left));

        this.state.treeStyle = {
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            minWidth: `${minWidth}px`,
            maxHeight: `${maxDropdown}px`,
            overflow: 'auto',
            zIndex: 1000
        } as any;

        const input = (this as any).getComponent('form-list-input-' + this.state.listId)?.el;
        const list = (this as any).getComponent(this.state.treeId)?.el;
        const buttons = (this as any).getComponent('buttonbar' + this.state.listId)?.el;
        if (input) { input.style = 'grid-row: 1'; }
        if (list) { list.style = 'grid-row: 2'; }
        if (buttons) { buttons.style = 'grid-row: 3'; }
    }

}

module.exports = Component;