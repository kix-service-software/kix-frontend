/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../model/FormValues/SelectObjectFormValue';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: SelectObjectFormValue<Array<string | number> | string | number>;
    private searchTimeout: any;
    private isFocusFreeText: boolean;

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.treeId = this.formValue?.instanceId;

        this.state.searchPlaceholder = await TranslationService.translate('Translatable#search ...');
        this.state.hasFilter = this.formValue.isAutoComplete || this.formValue.hasFilter;
        this.state.prepared = true;

        setTimeout(() => {
            const element = (this as any).getEl(this.state.searchValueKey + '-keylistener');
            if (this.formValue.treeHandler && element) {
                this.formValue.treeHandler.setKeyListenerElement(element);
            }

            const myDropdown = document.getElementById(`id_${this.state.searchValueKey}`);
            myDropdown?.addEventListener('hidden.bs.dropdown', async () => {
                await this.formValue?.setSelectedNodes();
                this.state.selectedNodes = await this.formValue?.getSelectedTreeNodes();
                if (this.formValue.isAutoComplete) {
                    this.formValue?.treeHandler?.setTree([]);
                }
                const searchInput: any = (this as any).getEl(this.state.searchValueKey);
                if (searchInput) {
                    searchInput.value = '';
                }
            });

            myDropdown?.addEventListener('show.bs.dropdown', () => {
                this.state.selectAll = this.formValue?.treeHandler?.getSelectedNodes()?.length <= 0;
            });

        }, 100);

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                if (data.blocked) {
                    this.state.readonly = true;
                } else {
                    this.state.readonly = this.formValue.readonly;
                }
            }
        };
        EventService.getInstance().subscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
    }

    public onDestroy(): void {
        this.formValue?.removePropertyBinding(this.bindingIds);
        EventService.getInstance().unsubscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
    }

    public onUpdate(): void {
        const filterInput = (this as any).getEl(this.state.searchValueKey);
        const hiddenInput = (this as any).getEl(this.state.searchValueKey + '-hidden');
        if (filterInput) {
            filterInput.focus();
        } else if (hiddenInput) {
            hiddenInput.focus();
        }
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue?.addPropertyBinding('maxSelectCount', () => {
                this.state.multiselect = this.formValue?.multiselect;
            }),
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.setReadonly(Boolean(formValue.readonly));
            }),
            this.formValue.addPropertyBinding(FormValueProperty.VALUE, async () => {
                this.state.selectedNodes = await this.formValue.getSelectedTreeNodes();
            }),
            this.formValue.addPropertyBinding('selectedNodes', async () => {
                this.state.prepared = false;
                this.state.selectedNodes = await this.formValue.getSelectedTreeNodes();
                setTimeout(() => this.state.prepared = true, 20);
            })
        );

        this.state.multiselect = this.formValue?.multiselect;

        this.state.autoComplete = this.formValue?.isAutoComplete;
        await this.prepareAutocompleteHint();

        this.state.selectedNodes = await this.formValue?.getSelectedTreeNodes() || [];

        this.setReadonly(Boolean(this.formValue?.readonly));
    }

    private setReadonly(readonly: boolean): void {
        if (this.state.readonly !== readonly) {
            this.state.prepared = false;

            this.state.readonly = readonly;
            if (!readonly) {
                this.state.dropdownAttributes = {
                    'data-bs-toggle': 'dropdown',
                    'aria-expanded': 'false'
                };
            } else {
                this.state.dropdownAttributes = {};
            }

            setTimeout(() => this.state.prepared = true, 5);
        }
    }

    public keydown(event: any): void {
        const filterInput = (this as any).getEl(this.state.searchValueKey);
        const hiddenInput = (this as any).getEl(this.state.searchValueKey + '-hidden');

        const isFilterInput = filterInput && document.activeElement === filterInput;
        if (!isFilterInput && event.key === 'Tab' && event.shiftKey) {
            if (document.activeElement === hiddenInput && filterInput) {
                this.stopPropagation(event);
                filterInput.focus();
            }
        }

        if (event.key === 'Enter' && this.formValue.freeText && this.isFocusFreeText) {
            if (Array.isArray(this.formValue.value) && this.formValue.multiselect) {
                this.formValue.setFormValue([...this.formValue.value, event.target.value]);
            } else {
                this.formValue.setFormValue([event.target.value]);
            }
        }
    }

    public keydownOnSelectInput(event: any): void {
        if (event.code === 'Space' || event.key === 'Enter') {
            this.stopPropagation(event);
            event.target?.click();
        }
    }

    public searchValueChanged(event: any): void {
        const filterInput = (this as any).getEl(this.state.searchValueKey);
        const hiddenInput = (this as any).getEl(this.state.searchValueKey + '-hidden');

        const isFilterInput = filterInput && document.activeElement === filterInput;

        if (isFilterInput && !this.navigationKeyPressed(event.key)) {
            this.isFocusFreeText = true;
            this.stopPropagation(event);

        } else if (isFilterInput && event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            this.isFocusFreeText = false;
            if (hiddenInput) {
                hiddenInput.focus();
            }
        } else if (isFilterInput && event.code === 'Space') {
            this.stopPropagation(event);
        } else if (isFilterInput && event.key === 'a' && event.ctrlKey) {
            this.stopPropagation(event);
        }

        if (event.ctrlKey) {
            this.stopPropagation(event);
        }

        if (this.searchTimeout) {
            window.clearTimeout(this.searchTimeout);
        }

        if (!this.navigationKeyPressed(event.key)) {
            this.searchTimeout = setTimeout(async () => {
                this.state.searchLoading = true;
                await this.formValue?.search(event.target.value);
                this.state.noResult = !this.formValue.getSelectableTreeNodeValues()?.length;
                setTimeout(() => this.state.searchLoading = false, 100);
            }, this.formValue?.autoCompleteConfiguration?.delay || 300);
        }
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

    public selectInputClicked(event: any): void {
        if (this.formValue?.multiselect || this.state.readonly) {
            this.stopPropagation(event);
        }
    }

    public removeValue(node: TreeNode, event: any): void {
        this.stopPropagation(event);
        this.formValue.removeValue(node.id);
    }

    public clearValue(event: any): void {
        this.stopPropagation(event);
        this.formValue.removeValue(null);
    }

    public selectAll(event: any): void {
        this.stopPropagation(event);

        if (this.state.selectAll) {
            this.formValue?.treeHandler?.selectAll();
            this.state.selectAll = false;
        } else {
            this.formValue?.treeHandler?.selectNone();
            this.state.selectAll = true;
        }
    }

    public inputClicked(event: any): void {
        if (this.state.readonly) {
            this.stopPropagation(event);
            event.preventDefault();
        } else {
            setTimeout(() => {
                const element = (this as any).getEl(this.state.searchValueKey);
                if (element) {
                    element.focus();
                }
            }, 50);
        }
    }

    public async select(event: any, reopen?: boolean): Promise<void> {
        await this.formValue?.setSelectedNodes();
        this.state.selectedNodes = await this.formValue?.getSelectedTreeNodes();

        if (reopen) {
            setTimeout(() => {
                const element = document.getElementById(`id_${this.state.searchValueKey}`);
                element?.click();
            }, 50);
        }
    }

    public async apply(event: any): Promise<void> {
        await this.select(event, false);
        const element = document.getElementById(`id_${this.state.searchValueKey}`);
        element?.click();
    }

    public async prepareAutocompleteHint(): Promise<void> {
        if (this.formValue.autoCompleteConfiguration) {
            const objectName = await TranslationService.translate(
                this.formValue.autoCompleteConfiguration.noResultsObjectName || 'Objects'
            );
            const message = await TranslationService.translate(
                'Translatable#No {0} found (add at least {1} characters).',
                [objectName, this.formValue.autoCompleteConfiguration.charCount]
            );

            this.state.autoCompleteHint = message;
        }
    }

    private stopPropagation(event: any): void {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        if (event.preventDefault) {
            event.preventDefault();
        }
    }

}

module.exports = Component;