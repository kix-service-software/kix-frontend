/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { BooleanFormValue } from '../../../../model/FormValues/BooleanFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ObjectFormEventData } from '../../../../model/ObjectFormEventData';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: BooleanFormValue;

    public onCreate(input: any): void {
        super.onCreate(input, 'inputs/checkbox-form-input');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    private async update(): Promise<void> {
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
        await super.onMount();

        this.state.value = Boolean(this.formValue?.value);

        super.registerEventSubscriber(
            function (data: ObjectFormEventData, eventId: string): void {
                if (this.context?.instanceId === data.contextInstanceId) {
                    if (data.blocked) {
                        this.state.readonly = true;
                    } else {
                        this.state.readonly = this.formValue.readonly;
                    }
                }
            },
            [ObjectFormEvent.BLOCK_FORM]
        );
    }

    public onDestroy(): void {
        super.onDestroy();

        this.formValue?.removePropertyBinding(this.bindingIds);
    }

    public valueChanged(value: string): void {
        this.state.value = !this.state.value;
        this.formValue.setFormValue(this.state.value);
    }

}

module.exports = Component;
