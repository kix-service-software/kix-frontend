/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { CheckListItem } from '../../core/CheckListItem';

import { DynamicFieldFormUtil } from '../../../../base-components/webapp/core/DynamicFieldFormUtil';

class Component extends FormInputComponent<CheckListItem[], ComponentState> {

    public async setCurrentValue(): Promise<void> {
        return;
    }

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const defaultValue = formInstance.getFormFieldValue<[]>(this.state.field.instanceId);
        if (defaultValue && defaultValue.value) {
            this.state.checklist = defaultValue.value;
            this.setProgressValues();

        }
        this.state.prepared = true;
    }

    public itemValueChanged(item: CheckListItem): void {
        event.stopPropagation();
        event.preventDefault();

        this.setProgressValues();
        (this as any).setStateDirty('checklist');
        super.provideValue(this.state.checklist);
    }

    private setProgressValues(): void {
        const values = DynamicFieldFormUtil.getInstance().countValues(this.state.checklist);
        this.state.progressValue = values[0];
        this.state.progressMax = values[1];
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

}

module.exports = Component;
