/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { FormService } from '../../core/FormService';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';

class Component extends FormInputComponent<any, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        const option = this.state.field.options.find((o) => o.option === FormFieldOptions.OBJECT_TYPE);
        if (option && option.value) {
            const searchDefinition = SearchService.getInstance().getSearchDefinition(option.value);
            this.state.manager = searchDefinition.createFormManager();

            this.state.manager.reset();
            this.state.manager.init();

            this.state.manager.registerListener(this.state.field.instanceId, () => {
                const filterCriteria = [];
                const values = this.state.manager.getValues();
                values.forEach((v) => filterCriteria.push(searchDefinition.getFilterCriteria(v)));
                super.provideValue(filterCriteria, true);
            });
        }

        await super.onMount();
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<FilterCriteria[]>(this.state.field.instanceId);
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
