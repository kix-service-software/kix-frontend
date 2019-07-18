/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent, KIXObjectType, FormFieldOptions } from '../../../../../core/model';
import { IAutofillConfiguration, AutocompleteFormFieldOption } from '../../../../../core/browser/components';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setCurrentValue();

        const autofillOption = this.state.field.options.find((o) => o.option === FormFieldOptions.AUTO_COMPLETE);
        if (autofillOption) {
            const autocompleteOption = (autofillOption.value as AutocompleteFormFieldOption);
            const component = (this as any).getComponent(this.state.field.instanceId);
            if (component) {
                component.setAutocompleteConfiguration(autocompleteOption);
            }
        }
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentValue = this.state.defaultValue.value;
            super.provideValue(this.state.currentValue);
        }
    }

    public valueChanged(value: string): void {
        this.state.currentValue = value;
        if (this.state.currentValue === '') {
            this.state.currentValue = null;
        }
        super.provideValue(this.state.currentValue);
    }

}

module.exports = Component;
