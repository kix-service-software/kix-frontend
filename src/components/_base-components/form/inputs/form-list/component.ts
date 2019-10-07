/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeNode, TreeHandler, TreeService } from '../../../../../core/model';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { ComponentInput } from './ComponentInput';

class Component {

    private state: ComponentState;
    private keepExpanded: boolean = false;
    private treeHandler: TreeHandler;
    private removeTreeHandler: boolean = false;

    private toggleTimeout: any;

    public getTreeHandler(): TreeHandler {
        return this.treeHandler;
    }

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.treeId = typeof input.treeId !== 'undefined' ? input.treeId : this.state.treeId;
        this.state.loadNodes = input.loadNodes;
        this.state.disabled = typeof input.disabled !== 'undefined' ? input.disabled : false;
        this.state.readonly = typeof input.readonly !== 'undefined' ? input.readonly : false;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
        this.state.multiselect = typeof input.multiselect !== 'undefined' ? input.multiselect : false;

        const canRemove = typeof input.canRemoveNode !== 'undefined' ? input.canRemoveNode : true;
        this.state.removeNodes = canRemove && !this.state.readonly;

        this.update(input);
    }

    private async update(input: any): Promise<void> {
        this.state.placeholder = await TranslationService.translate(input.placeholder);
    }

    public async onMount(): Promise<void> {
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
            if (!this.state.multiselect && nodes.length > 0) {
                this.toggleList(true);
            }
            (this as any).emit('nodesChanged', nodes);
        });

        this.treeHandler.registerListener(this.state.treeId + '-listener', (nodes: TreeNode[]) => {
            this.setDropdownStyle();
        });

        this.state.prepared = true;
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
        document.removeEventListener('click', this.checkExpandState.bind(this));
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

    public setKeepExpanded(): void {
        this.keepExpanded = true;
    }

    public submitClicked(): void {
        this.toggleList(true);
    }

    private toggleList(close: boolean = true, event?: any): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        if (!this.toggleTimeout) {
            this.toggleTimeout = setTimeout(() => {
                if (!this.state.disabled) {
                    if (this.state.expanded && close) {
                        this.state.expanded = false;
                        this.treeHandler.active = false;

                        const hiddenInput = (this as any).getEl("hidden-form-list-input");
                        if (hiddenInput) {
                            hiddenInput.focus();
                        }

                    } else if (!this.state.readonly) {
                        this.state.expanded = true;
                        this.treeHandler.active = true;
                        setTimeout(() => {
                            this.setDropdownStyle();
                        }, 100);
                    }
                    this.toggleTimeout = null;
                }
            }, 75);

        }
    }

    private setDropdownStyle(): void {
        const valueList = (this as any).getEl('value-list-' + this.state.treeId);
        let transformValue = 1;
        if (valueList) {
            const formListInputContainer = (this as any).getEl('form-list-input-container-' + this.state.listId);
            let container = formListInputContainer;
            while (container
                && container.parentNode
                && container.parentNode.className !== 'overlay-dialog'
                && container.parentNode.className !== 'lane-widget') {
                container = container.parentNode;
            }

            const dropdownListEnd = formListInputContainer.getBoundingClientRect().top
                + formListInputContainer.getBoundingClientRect().height
                + valueList.getBoundingClientRect().height;

            const containerEnd = container && container.getBoundingClientRect
                ? container.getBoundingClientRect().top + container.getBoundingClientRect().height
                : dropdownListEnd;

            const input = (this as any).getEl('form-list-input-' + this.state.listId);
            const list = (this as any).getEl(this.state.treeId);
            const buttons = (this as any).getEl('buttonbar');

            if (containerEnd < dropdownListEnd) {
                transformValue
                    = formListInputContainer.getBoundingClientRect().height
                    + valueList.getBoundingClientRect().height
                    - 1;
                this.state.treeStyle = { transform: `translate(0px, -${transformValue}px)` };

                if (input) {
                    input.style = `grid-row: ${buttons ? 3 : 2}`;
                }
                if (list) {
                    list.style = 'grid-row: 1';
                }
                if (buttons) {
                    buttons.style = 'grid-row: 2';
                }
            } else {
                this.state.treeStyle = { top: (formListInputContainer.getBoundingClientRect().height - 1) + 'px' };
                if (input) {
                    input.style = 'grid-row: 1';
                }
                if (list) {
                    list.style = 'grid-row: 2';
                }
                if (buttons) {
                    buttons.style = 'grid-row: 3';
                }
            }
        }
    }

}

module.exports = Component;
