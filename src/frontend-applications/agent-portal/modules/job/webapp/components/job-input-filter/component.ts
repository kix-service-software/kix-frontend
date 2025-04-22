/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { JobProperty } from '../../../model/JobProperty';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TreeService } from '../../../../base-components/webapp/core/tree';
import { IdService } from '../../../../../model/IdService';
import { FilterType } from '../../../../../model/FilterType';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { JobFormService } from '../../core/JobFormService';
import { SearchService } from '../../../../search/webapp/core/SearchService';

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
        this.listenerId = IdService.generateDateBasedId('job-input-filter-manager-listener');
        await this.setManager();
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: 'JobInputFilter',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string): Promise<void> => {
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

    // eslint-disable-next-line max-lines-per-function
    private async setManager(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;

        const jobFormManager = JobFormService.getInstance().getJobFormManager(type);

        this.state.manager = jobFormManager?.getFilterManager() || jobFormManager?.filterManager;
        if (this.state.manager) {
            this.state.manager.allowEmptyValues = false;
            this.state.manager.fieldInstanceId = this.state.field.instanceId;
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
                        const searchDefinition = SearchService.getInstance().getSearchDefinition(
                            this.state.manager.objectType
                        );
                        if (searchDefinition) {
                            filterValues = values.map((v) => searchDefinition.getFilterCriteria(v));
                        } else {
                            // take it as given (e.g. for type "Reporting")
                            filterValues = values.map((v) =>
                                new FilterCriteria(
                                    v.property, v.operator, FilterDataType.STRING, FilterType.AND, v.value
                                )
                            );
                        }
                    }

                    await this.state.manager.validate();
                    super.provideValue(filterValues, true);
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.manager) {
            this.state.manager.unregisterListener(this.listenerId);
            this.state.manager.getValues().forEach((v) =>
                TreeService.getInstance().removeTreeHandler('value-' + v.id)
            );
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

    private async setCriteria(criteria: any, fromBackend?: boolean): Promise<void> {
        let objectType: KIXObjectType | string;
        const inputType = await this.state.manager.getInputType(fromBackend ? criteria.Field : criteria.property);
        if (inputType) {
            if (inputType === InputFieldTypes.OBJECT_REFERENCE) {
                objectType = await this.state.manager.getObjectReferenceObjectType(
                    fromBackend ? criteria.Field : criteria.property
                );
            }
        }

        if (fromBackend && criteria.Operator === 'WITHIN') {
            if (Array.isArray(fromBackend ? criteria.Value : criteria.value)) {
                const val = fromBackend ? criteria.Value : criteria.value;
                if (val.length === 2) {
                    const newValue = [];
                    const partsFrom = val[0].split(/(\d+)/);
                    if (partsFrom.length === 3) {
                        newValue[0] = partsFrom[0];
                        newValue[1] = partsFrom[1];
                        newValue[2] = partsFrom[2];
                    }
                    const partsTo = val[1].split(/(\d+)/);
                    if (partsTo.length === 3) {
                        newValue[3] = partsTo[0];
                        newValue[4] = partsTo[1];
                        newValue[5] = partsTo[2];
                    }

                    if (fromBackend) {
                        criteria.Value = newValue;
                    } else {
                        criteria.value = newValue;
                    }
                }
            }
        }

        const filterValue = new ObjectPropertyValue(
            fromBackend ? criteria.Field : criteria.property,
            fromBackend ? criteria.Operator : criteria.operator,
            fromBackend ? criteria.Value : criteria.value,
            [], false, true, objectType
        );
        this.state.manager.setValue(filterValue);
    }
}

module.exports = Component;
