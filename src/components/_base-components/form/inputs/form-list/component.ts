import { ComponentState } from './ComponentState';
import { TreeNode, AutoCompleteConfiguration } from '../../../../../core/model';
import { FormInputAction } from '../../../../../core/browser';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { ComponentInput } from './ComponentInput';

class Component {

    private state: ComponentState;

    private keepExpanded: boolean = false;
    private autocompleteTimeout: any;
    private freeText: boolean = false;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.disabled = typeof input.disabled !== 'undefined' ? input.disabled : false;
        this.state.actions = typeof input.actions !== 'undefined' ? input.actions : [];
        this.state.readonly = typeof input.readonly !== 'undefined' ? input.readonly : false;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
        this.state.asAutocomplete = typeof input.autocomplete !== 'undefined' ? input.autocomplete : false;
        this.state.asMultiselect = typeof input.multiselect !== 'undefined' ? input.multiselect : false;
        this.freeText = typeof input.freeText !== 'undefined' ? input.freeText : false;

        if (!this.state.asAutocomplete) {
            this.state.nodes = typeof input.nodes !== 'undefined' ? input.nodes : this.state.nodes;
        }
        this.state.selectedNodes = typeof input.selectedNodes !== 'undefined' && input.selectedNodes !== null ?
            input.selectedNodes : this.state.selectedNodes;
        this.state.selectedNodes = this.state.selectedNodes.filter((n) => n && typeof n.id !== 'undefined');

        if (!this.state.asMultiselect && this.state.selectedNodes.length > 1) {
            this.state.selectedNodes.splice(1);
            (this as any).emit('nodesChanged', this.state.selectedNodes);
        }

        if (this.state.asAutocomplete) {
            this.state.autoCompleteConfiguration = input.autoCompleteConfiguration || new AutoCompleteConfiguration();
            this.state.searchCallback = input.searchCallback;
        }
        this.state.removeNode = typeof input.removeNode !== 'undefined' ? input.removeNode : true;

        this.update(input);

        this.setCheckState();
    }

    private async update(input: any): Promise<void> {
        this.state.placeholder = await TranslationService.translate(input.placeholder);
        this.state.autoCompletePlaceholder = this.state.asAutocomplete
            ? await TranslationService.translate('Translatable#Enter search value')
            : await TranslationService.translate('Translatable#Filter in list');
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Submit"
        ]);

        document.addEventListener('click', (event) => {
            if (this.state.expanded) {
                if (this.keepExpanded) {
                    this.keepExpanded = false;
                } else {
                    this.toggleList();
                }
            }
        });

        await this.prepareAutocompleteNotFoundText();
        this.setCheckState();
    }

    public onDestroy(): void {
        document.removeEventListener('click', (event) => {
            if (this.state.expanded) {
                if (this.keepExpanded) {
                    this.keepExpanded = false;
                } else {
                    this.toggleList();
                }
            }
        });
    }

    public setKeepExpanded(): void {
        this.keepExpanded = true;
    }

    private toggleList(close: boolean = true): void {
        if (!this.state.disabled) {
            if (this.state.expanded && close) {
                this.state.expanded = false;
                this.state.filterValue = null;
                this.state.autocompleteSearchValue = null;
                if (this.state.asAutocomplete) {
                    this.state.nodes = [];
                }
            } else if (!this.state.readonly) {
                this.state.expanded = true;
                setTimeout(() => {
                    this.setDropdownStyle();
                    this.focusInput();
                }, 100);
            }
        }
    }

    public listToggleButtonClicked(event: Event): void {
        this.toggleList();
    }

    public nodeToggled(): void {
        this.focusInput();
    }

    private focusInput(): void {
        const input = (this as any).getEl('form-list-input-' + this.state.listId);
        if (input) {
            input.focus();
            input.select();
        }
    }

    public keyDown(event: any): void {
        if (this.state.expanded) {
            if (event.key === 'Escape' || event.key === 'Tab') {
                this.toggleList();
            }
        }
    }

    public keyUp(event: any): void {
        if (!this.navigationKeyPressed(event)) {
            if (this.state.asAutocomplete && typeof event.target.value !== 'undefined' && this.state.searchCallback) {
                this.state.autocompleteSearchValue = event.target.value;
                this.startSearch();
            } else {
                this.state.filterValue = event.target.value;
                setTimeout(() => {
                    this.setDropdownStyle();
                    this.setCheckState();
                }, 50);
            }
        } else if (event.key === 'Enter' && this.freeText) {
            const value = event.target.value;
            if (value && value !== '') {
                const freeTextNode = new TreeNode(value, value);
                this.nodeClicked(freeTextNode);
                this.toggleList(true);
            }
        }
    }

    private navigationKeyPressed(event: any): boolean {
        return event.key === 'ArrowLeft'
            || event.key === 'ArrowRight'
            || event.key === 'ArrowUp'
            || event.key === 'ArrowDown'
            || event.key === 'Tab'
            || event.key === 'Escape'
            || event.key === 'Enter';
    }

    public nodeClicked(node: TreeNode): void {
        if (this.state.asMultiselect) {
            this.handleMultiselect(node);
        } else {
            this.handleSingleselect(node);
        }

        setTimeout(() => {
            this.setDropdownStyle();
            this.focusInput();
            this.setCheckState();
        }, 50);

        (this as any).emit('nodesChanged', this.state.selectedNodes);
    }

    private handleMultiselect(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        } else {
            this.state.selectedNodes.push(node);
        }
        (this as any).setStateDirty('selectedNodes');
    }

    private handleSingleselect(node: TreeNode): void {
        this.state.selectedNodes = [node];
        this.toggleList();
    }

    public removeSelectedItem(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        }
        (this as any).setStateDirty('selectedNodes');
        (this as any).emit('nodesChanged', this.state.selectedNodes);
    }

    private startSearch(): void {
        if (this.autocompleteTimeout && !this.state.isLoading) {
            window.clearTimeout(this.autocompleteTimeout);
            this.autocompleteTimeout = null;
        }
        const hasMinLength =
            this.state.autocompleteSearchValue.length >= this.state.autoCompleteConfiguration.charCount;
        if (hasMinLength && !this.state.isLoading) {
            this.autocompleteTimeout = setTimeout(this.loadData.bind(this), this.state.autoCompleteConfiguration.delay);
        } else {
            this.state.nodes = [];
        }
    }

    private async loadData(): Promise<void> {
        this.state.isLoading = true;
        this.state.expanded = true;
        this.state.nodes = await this.state.searchCallback(
            this.state.autoCompleteConfiguration.limit, this.state.autocompleteSearchValue
        );
        this.state.isLoading = false;
        this.autocompleteTimeout = null;

        if (this.state.nodes.length === 0) {
            this.prepareAutocompleteNotFoundText();
        }

        setTimeout(() => {
            this.setDropdownStyle();
            this.focusInput();
            this.setCheckState();
        }, 50);
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
            const containerEnd = container.getBoundingClientRect().top + container.getBoundingClientRect().height;
            const dropdownListEnd = formListInputContainer.getBoundingClientRect().top
                + formListInputContainer.getBoundingClientRect().height
                + valueList.getBoundingClientRect().height;

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
                    input.style = 'grid-row: 3';
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

    public async prepareAutocompleteNotFoundText(): Promise<void> {
        if (this.state.autoCompleteConfiguration) {
            const objectName = await TranslationService.translate(
                this.state.autoCompleteConfiguration.noResultsObjectName || 'Objects'
            );
            const message = await TranslationService.translate(
                'Translatable#No {0} found (add at least {1} characters).',
                [objectName, this.state.autoCompleteConfiguration.charCount]
            );

            this.state.autocompleteNotFoundText = message;
        }
    }

    public clear(): void {
        this.state.selectedNodes = [];
    }

    public selectAll(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const checkBox = (this as any).getEl('selectAllCheckbox');
        const tree = (this as any).getComponent(this.state.treeId);
        if (checkBox && tree) {
            const nodes = tree.getFilteredNodes() || [];
            if (checkBox.checked) {
                this.selectNodes(nodes);
            } else {
                this.state.selectedNodes = this.state.selectedNodes.filter((sn) => !this.isNodeAviable(sn, nodes));
            }
            setTimeout(() => {
                this.setDropdownStyle();
                this.focusInput();
                this.setCheckState();
            }, 50);
            (this as any).emit('nodesChanged', this.state.selectedNodes);
        }
    }

    private selectNodes(nodes: TreeNode[]): void {
        nodes.forEach((n) => {
            if (!this.state.selectedNodes.some((sn) => sn.id === n.id)) {
                this.state.selectedNodes.push(n);
            }

            if (n.children) {
                this.selectNodes(n.children);
            }
        });
    }

    private isNodeAviable(node: TreeNode, nodes: TreeNode[]): boolean {
        for (const n of nodes) {
            if (n.id === node.id) {
                return true;
            }

            if (n.children) {
                const isAvailable = this.isNodeAviable(node, n.children);
                if (isAvailable) {
                    return true;
                }
            }
        }
        return false;
    }

    private setCheckState(): void {
        const checkBox = (this as any).getEl('selectAllCheckbox');
        const tree = (this as any).getComponent(this.state.treeId);
        if (checkBox && tree) {
            const nodes = tree.getFilteredNodes() || [];
            const checkNodes = this.state.selectedNodes.filter(
                (sn) => nodes.some((n) => n.id === sn.id)
            );
            let checked = true;
            let indeterminate = false;
            if (checkNodes.length === 0) {
                checked = false;
            } else if (checkNodes.length < nodes.length) {
                checked = false;
                indeterminate = true;
            }
            setTimeout(() => {
                checkBox.checked = checked;
                checkBox.indeterminate = indeterminate;
            }, 10);
        }
    }

    public submit(): void {
        event.stopPropagation();
        event.preventDefault();
        this.toggleList();
    }

    public actionClicked(action: FormInputAction): void {
        action.callback(action);
    }
}

module.exports = Component;
