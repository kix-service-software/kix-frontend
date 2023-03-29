/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { DynamicFieldCountableFormValue } from '../../../../model/FormValues/DynamicFields/DynamicFieldCountableFormValue';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private formValue: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.formValue = input.formValue;
        this.state.readonly = this.formValue?.readonly;
    }

    public async onMount(): Promise<void> {
        const formValue = this.getCountableFormValue();
        this.state.canAdd = formValue?.canAddValue(this.formValue.instanceId);
        this.state.canRemove = formValue?.canRemoveValue(this.formValue.instanceId);
    }

    public async addValue(): Promise<void> {
        const formValue = this.getCountableFormValue();
        await formValue?.addFormValue(this.formValue.instanceId, null);
        this.state.canAdd = formValue?.canAddValue(this.formValue.instanceId);
        this.state.canRemove = formValue?.canRemoveValue(this.formValue.instanceId);
    }

    public async removeValue(): Promise<void> {
        const formValue = this.getCountableFormValue();
        await formValue?.removeFormValue(this.formValue.instanceId);
        this.state.canAdd = formValue?.canAddValue(this.formValue.instanceId);
        this.state.canRemove = formValue?.canRemoveValue(this.formValue.instanceId);
    }

    private getCountableFormValue(): DynamicFieldCountableFormValue {
        let formValue: DynamicFieldCountableFormValue = this.formValue;
        if (!(formValue as any).IS_COUNTABLE) {
            formValue = formValue?.parent as DynamicFieldCountableFormValue;
        }

        return formValue instanceof DynamicFieldCountableFormValue ? formValue : null;
    }

}

module.exports = Component;