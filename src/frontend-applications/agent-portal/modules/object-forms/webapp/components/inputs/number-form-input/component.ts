/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { NumberFormValue } from '../../../../model/FormValues/NumberFormValue';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: NumberFormValue;
    private changeTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.prepareOptions();

        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.VALUE, async (formValue: ObjectFormValue) => {
                    this.state.value = formValue.value;
                }
            )
        );

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );

        this.state.value = this.formValue?.value;
        this.state.readonly = this.formValue?.readonly;
    }

    public async onMount(): Promise<void> {
        this.state.prepared = true;
    }

    private async prepareOptions(): Promise<void> {
        this.state.max = this.formValue?.max;
        this.state.min = this.formValue?.min;
        this.state.step = this.formValue?.step;
        this.state.unitString = this.formValue?.unitString;
    }

    public valueChanged(event: any): void {
        if (this.changeTimeout) {
            window.clearTimeout(this.changeTimeout);
        }

        this.changeTimeout = setTimeout(async () => {
            this.state.value = event.target.value;
            this.formValue.setFormValue(this.state.value);
        }, 500);
    }
}

module.exports = Component;
