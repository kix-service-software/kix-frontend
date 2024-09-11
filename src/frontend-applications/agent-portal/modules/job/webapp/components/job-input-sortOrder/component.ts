/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { JobProperty } from '../../../model/JobProperty';
import { JobFormService } from '../../core';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TreeHandler, TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { IdService } from '../../../../../model/IdService';
import { AbstractJobFormManager } from '../../core/AbstractJobFormManager';
import { JobSortOrder } from '../../../model/JobSortOrder';
import { SearchFormManager } from '../../../../base-components/webapp/core/SearchFormManager';

class Component extends FormInputComponent<any, ComponentState> {

    private formSubscriber: IEventSubscriber;
    private sortAttributeTreeHandler: TreeHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.prepareSort();

        this.formSubscriber = {
            eventSubscriberId: 'JobInputSortOrder',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string): Promise<void> => {
                const jobTypeValue = data.changedValues.find((cv) => cv[0] && cv[0].property === JobProperty.TYPE);
                if (jobTypeValue) {
                    this.state.prepared = false;
                    this.prepareSort();
                    this.state.prepared = true;
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);

        this.state.prepared = true;
    }

    private async prepareSort(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;
        const jobFormManager: AbstractJobFormManager = JobFormService.getInstance().getJobFormManager(type);
        const filterManager = jobFormManager?.getFilterManager() || jobFormManager?.filterManager;

        if (filterManager && typeof filterManager['getSortAttributeTree'] === 'function') {
            const sortAttributeNodes = await (filterManager as SearchFormManager).getSortAttributeTree(true, true);
            if (Array.isArray(sortAttributeNodes) && sortAttributeNodes.length) {
                if (!this.sortAttributeTreeHandler) {
                    this.state.sortTreeId = IdService.generateDateBasedId('search-sort-attribute-');
                    this.sortAttributeTreeHandler = new TreeHandler(null, null, null, false);
                    TreeService.getInstance().registerTreeHandler(this.state.sortTreeId, this.sortAttributeTreeHandler);
                }
                this.sortAttributeTreeHandler.setTree(sortAttributeNodes);
                if (this.state.sortAttribute) {
                    const node = sortAttributeNodes.find((n) => n.id === this.state.sortAttribute);
                    if (node) {
                        this.sortAttributeTreeHandler.setSelection([node], true, true, true);
                    }
                }
            }
        }

    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const value = formInstance.getFormFieldValue<any>(this.state.field?.instanceId);
        if (value && value.value) {
            this.state.sortAttribute = (value.value as JobSortOrder).Field;
            this.state.sortDescending = Boolean((value.value as JobSortOrder).Direction === 'descending');
        }
    }

    public sortAttributeChanged(nodes: TreeNode[]): void {
        this.state.sortAttribute = nodes?.length ? nodes[0].id : null;
        this.setValue();
    }

    public sortDescendingChanged(): void {
        this.state.sortDescending = !this.state.sortDescending;
        this.setValue();
    }

    private setValue(): void {
        if (this.state.sortAttribute) {
            const sortorder = new JobSortOrder(
                {
                    Field: this.state.sortAttribute,
                    Direction: this.state.sortDescending ? 'descending' : 'ascending'
                }
            );
            super.provideValue(sortorder);
        } else {
            super.provideValue(null);
        }
    }
}

module.exports = Component;
