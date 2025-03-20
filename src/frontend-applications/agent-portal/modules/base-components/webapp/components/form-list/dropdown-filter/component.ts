/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TreeHandler, TreeService, TreeNode } from '../../../core/tree';

class Component extends AbstractMarkoComponent<ComponentState> {

    private autocompleteTimeout: any;

    private treeId: string;
    private handler: TreeHandler;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.treeId = input.treeId;
    }

    public onInput(input: any): void {
        this.state.autocompleteConfiguration = input.autocompleteConfiguration;
        this.state.searchCallback = input.autocompleteSearchCallback;
        this.state.freeText = typeof input.freeText !== 'undefined' ? input.freeText : false;
        this.update();
    }

    private async update(): Promise<void> {
        this.state.placeholder = this.state.autocompleteConfiguration
            ? await TranslationService.translate('Translatable#Enter search value')
            : await TranslationService.translate('Translatable#Filter in list');
    }

    public async onMount(): Promise<void> {
        if (this.treeId) {
            this.handler = TreeService.getInstance().getTreeHandler(this.treeId);
            this.state.tree = this.handler.getTree();
            this.handler.filter(null);
        }

        this.state.placeholder = this.state.autocompleteConfiguration
            ? await TranslationService.translate('Translatable#Enter search value')
            : await TranslationService.translate('Translatable#Filter in list');

        this.prepareAutocompleteNotFoundText();
    }

    public onUpdate(): void {
        const filterInput = (this as any).getEl('form-list-input');
        const hiddenInput = (this as any).getEl('hidden-filter-input');
        if (filterInput) {
            filterInput.focus();
        } else if (hiddenInput) {
            hiddenInput.focus();
        }
    }

    public stopEvent(event: any): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    public keyup(event: any): void {
        const filterInput = (this as any).getEl('form-list-input');
        const hiddenInput = (this as any).getEl('hidden-filter-input');

        const isFilterInput = filterInput && document.activeElement === filterInput;

        if (isFilterInput && !this.navigationKeyPressed(event.key)) {
            this.stopEvent(event);
            const value = event.target.value;
            if (this.state.autocompleteConfiguration
                && typeof value !== 'undefined'
                && this.state.searchCallback
            ) {
                this.state.filterValue = value;
                this.startSearch();
            } else {
                this.state.filterValue = value;
                this.handler.filter(this.state.filterValue);
            }
        } else if (isFilterInput && event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (hiddenInput) {
                hiddenInput.focus();
            }
        } else if (isFilterInput && event.code === 'Space' && this.state.filterValue && this.state.filterValue !== '') {
            this.stopEvent(event);
            this.state.filterValue = this.state.filterValue + ' ';
        } else if (isFilterInput && event.key === 'a' && event.ctrlKey) {
            this.stopEvent(event);
        }

        if (event.ctrlKey) {
            this.stopEvent(event);
        }
    }

    public keydown(event: any): void {
        const filterInput = (this as any).getEl('form-list-input');
        const hiddenInput = (this as any).getEl('hidden-filter-input');

        const isFilterInput = filterInput && document.activeElement === filterInput;
        if (!isFilterInput && event.key === 'Tab' && event.shiftKey) {
            if (document.activeElement === hiddenInput && filterInput) {
                this.stopEvent(event);
                filterInput.focus();
            }
        } else if (isFilterInput
            && event.key === 'Enter'
            && this.state.freeText
            && this.state.filterValue
            && this.state.filterValue !== ''
        ) {
            this.stopEvent(event);
            const node = new TreeNode(this.state.filterValue, this.state.filterValue);
            this.handler.setSelection([node], true);
            this.state.filterValue = null;
        }
    }

    public hasManyNodes(): boolean {
        return this.handler && this.handler.getTreeLength() > 7;
    }

    private navigationKeyPressed(key: string): boolean {
        return key === 'ArrowLeft'
            || key === 'ArrowRight'
            || key === 'ArrowUp'
            || key === 'ArrowDown'
            || key === 'Tab'
            || key === 'Escape'
            || key === 'Enter';
    }

    private startSearch(): void {
        if (this.autocompleteTimeout) {
            window.clearTimeout(this.autocompleteTimeout);
            this.autocompleteTimeout = null;
        }
        const hasMinLength =
            this.state.filterValue.length >= this.state.autocompleteConfiguration.charCount;
        if (hasMinLength) {
            this.autocompleteTimeout = setTimeout(this.loadData.bind(this), this.state.autocompleteConfiguration.delay);
        } else {
            this.handler.setTree([], null, true);
        }
    }

    private async loadData(): Promise<void> {
        this.state.loading = true;
        const nodes = await this.state.searchCallback(
            this.state.autocompleteConfiguration.limit, this.state.filterValue
        ) || [];

        this.handler.setTree(nodes, null, true);
        this.state.tree = nodes;

        this.state.loading = false;
        this.autocompleteTimeout = null;

        if (nodes.length === 0) {
            this.prepareAutocompleteNotFoundText();
        }
    }

    public async prepareAutocompleteNotFoundText(): Promise<void> {
        if (this.state.autocompleteConfiguration) {
            const objectName = await TranslationService.translate(
                this.state.autocompleteConfiguration.noResultsObjectName || 'Objects'
            );
            const message = await TranslationService.translate(
                'Translatable#No {0} found (add at least {1} characters).',
                [objectName, this.state.autocompleteConfiguration.charCount]
            );

            this.state.autocompleteNotFoundText = message;
        }
    }

}

module.exports = Component;
