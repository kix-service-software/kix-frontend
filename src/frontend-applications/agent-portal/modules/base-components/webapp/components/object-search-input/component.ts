/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { SearchService } from '../../../../search/webapp/core';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { FormInputComponent } from '../../core/FormInputComponent';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { ContextService } from '../../core/ContextService';

class Component extends FormInputComponent<any, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        const option = this.state.field?.options.find((o) => o.option === FormFieldOptions.OBJECT_TYPE);
        if (option && option.value) {
            const searchDefinition = SearchService.getInstance().getSearchDefinition(option.value);

            let ignoreProperties = [];
            const ignoreOption = this.state.field?.options.find((o) => o.option === FormFieldOptions.IGNORE_PROPERTIES);
            if (ignoreOption && Array.isArray(ignoreOption.value)) {
                ignoreProperties = ignoreOption.value;
            }
            this.state.manager = searchDefinition.createFormManager(ignoreProperties);
            // do not mark viewable states as required
            this.state.manager['handleViewableStateType'] = false;

            this.state.manager.reset();
            this.state.manager.init();

            this.state.manager.registerListener(this.state.field?.instanceId, () => {
                const filterCriteria = [];
                const values = this.state.manager.getValues();
                values.forEach((v) => {
                    if (v.value !== null && typeof v.value !== 'undefined') {
                        filterCriteria.push(searchDefinition.getFilterCriteria(v));
                    }
                });
                super.provideValue(filterCriteria, true);
            });
        }

        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        this.state.manager?.unregisterListener(this.state.field?.instanceId);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<FilterCriteria[]>(this.state.field?.instanceId);
        if (this.state.manager && value && Array.isArray(value.value)) {
            for (const criteria of value.value) {
                this.state.manager.setValue(
                    new ObjectPropertyValue(criteria.property, criteria.operator, criteria.value)
                );
            }
        }
    }

}

module.exports = Component;
