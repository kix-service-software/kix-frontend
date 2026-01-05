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
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormHandler } from '../../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: ObjectFormValue;
    private changeTimeout: any;

    public onCreate(input: any): void {
        super.onCreate(input);
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

    private update(): void {
        this.bindingIds = [];

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.VALUE, (formValue: ObjectFormValue) => {
                this.state.value = formValue?.value;
            })
        );

        this.bindingIds.push(
            this.formValue.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue?.readonly;
            })
        );

        this.state.value = this.formValue?.value;
        this.state.readonly = this.formValue?.readonly;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.value = this.formValue?.value;

        if (this.formValue && this.formValue['rowCount']) {
            this.state.rowCount = Number(this.formValue['rowCount']) || 5;
        }
    }

    public onDestroy(): void {
        this.formValue?.removePropertyBinding(this.bindingIds);
    }

    public valueChanged(event: any): void {
        this.formValue.dirty = true;
        if (this.changeTimeout) {
            window.clearTimeout(this.changeTimeout);
        }

        this.changeTimeout = setTimeout(async () => {
            this.state.value = event.target.value;
            await this.formValue.setFormValue(this.state.value);
            this.formValue.dirty = false;
        }, ObjectFormHandler.TEXTFIELD_SUBMISSION_TIMEOUT);
    }

}

module.exports = Component;