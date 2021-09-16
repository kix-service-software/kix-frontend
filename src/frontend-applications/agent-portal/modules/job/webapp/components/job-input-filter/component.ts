/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { JobProperty } from '../../../model/JobProperty';
import { JobFormService } from '../../core';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { SearchService } from '../../../../search/webapp/core';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends FormInputComponent<any, ComponentState> {

    private listenerId: string;
    private formTimeout: any;
    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.listenerId = 'job-input-filter-manager-listener';
        await this.setManager();
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: 'JobInputFilter',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string) => {
                const jobTypeValue = data.changedValues.find((cv) => cv[0] && cv[0].property === JobProperty.TYPE);
                if (jobTypeValue) {
                    this.setManager();
                    await this.setCurrentValue();
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);

        this.state.prepared = true;
    }

    private async setManager(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;

        const jobFormManager = JobFormService.getInstance().getJobFormManager(type);

        this.state.manager = jobFormManager ? jobFormManager.filterManager : null;
        if (this.state.manager) {
            this.state.manager.init();
            this.state.manager.reset(false);

            this.state.manager.registerListener(this.listenerId, () => {
                if (this.formTimeout) {
                    clearTimeout(this.formTimeout);
                }
                this.formTimeout = setTimeout(async () => {
                    let filterValues: FilterCriteria[] = [];
                    if (await this.state.manager.hasDefinedValues()) {
                        const values = await this.state.manager.getEditableValues();
                        const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
                        filterValues = values.map((v) => searchDefinition.getFilterCriteria(v));
                    }
                    super.provideValue(filterValues, true);
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.manager) {
            this.state.manager.unregisterListener(this.listenerId);
            this.state.manager.reset(false);
        }
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<any>(this.state.field?.instanceId);
        if (value && value.value) {

            // value is frontend filter criteria (set in dialog)
            if (Array.isArray(value.value)) {
                for (const criteria of value.value) {
                    await this.setCriteria(criteria);
                }
            } else if (typeof value.value === 'object') {
                // value is a backend filter criteria (with AND and OR - inital value)
                for (const filter in value.value) {
                    if (value.value[filter] && value.value[filter]) {
                        for (const criteria of value.value[filter]) {
                            await this.setCriteria(criteria, true);
                        }
                    }
                }
            }
        }
    }

    private async setCriteria(criteria: any, fromBackend?: boolean) {
        let objectType: KIXObjectType | string;
        const inputType = await this.state.manager.getInputType(fromBackend ? criteria.Field : criteria.property);
        if (inputType) {
            if (inputType === InputFieldTypes.OBJECT_REFERENCE) {
                objectType = await this.state.manager.getObjectReferenceObjectType(
                    fromBackend ? criteria.Field : criteria.property
                );
            }
        }

        const filterValue = new ObjectPropertyValue(
            fromBackend ? criteria.Field : criteria.property,
            fromBackend ? criteria.Operator : criteria.operator,
            fromBackend ? criteria.Value : criteria.value,
            [], false, true, objectType, null, null,
            fromBackend ? criteria.Field : criteria.property
        );
        this.state.manager.setValue(filterValue);
    }
}

module.exports = Component;
