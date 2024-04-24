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

class Component {

    private state: ComponentState;
    private keepExpanded: boolean = false;
    private toggleButtonClicked: boolean = false;
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

        this.treeHandler.registerListener(this.state.treeId + '-listener', (nodes: TreeNode[]) => {
            setTimeout(() => this.setDropdownStyle(), 100);
        });

        this.state.prepared = true;

        EventService.getInstance().subscribe(ApplicationEvent.DROPDOWN_OPENED, {
            eventSubscriberId: 'form-list-' + this.state.treeId,
            eventPublished: (data) => {
                if (data !== this.state.treeId && this.state.expanded) {
                    this.toggleList(true, null, false);
                }
            }
        });
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

                        const hiddenInput = (this as any).getEl('hidden-form-list-input');
                        if (hiddenInput && holdFocus) {
                            hiddenInput.focus();
                        }

                    } else if (!this.state.readonly) {
                        this.state.expanded = true;
                        this.treeHandler.active = true;
                        EventService.getInstance().publish(ApplicationEvent.DROPDOWN_OPENED, this.state.treeId);
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

            const dropdownListEnd = formListInputContainer.getBoundingClientRect().top
                + formListInputContainer.getBoundingClientRect().height
                + valueList.getBoundingClientRect().height;

            const input = (this as any).getComponent('form-list-input-' + this.state.listId)?.el;
            const list = (this as any).getComponent(this.state.treeId)?.el;
            const buttons = (this as any).getComponent('buttonbar' + this.state.listId)?.el;

            const gap = (window.innerHeight || document.documentElement.clientHeight) - dropdownListEnd;
            if (gap < 0) {
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
