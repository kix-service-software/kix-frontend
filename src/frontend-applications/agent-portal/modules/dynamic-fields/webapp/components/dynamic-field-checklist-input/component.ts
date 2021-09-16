/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { CheckListItem } from '../../core/CheckListItem';

import { DynamicFieldFormUtil } from '../../../../base-components/webapp/core/DynamicFieldFormUtil';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends FormInputComponent<CheckListItem[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.prepared = true;
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<[]>(this.state.field?.instanceId);
        if (value) {
            let checklist = value.value;
            if (typeof checklist === 'string') {
                checklist = JSON.parse(checklist);
            }

            if (Array.isArray(checklist)) {
                this.state.checklist = checklist;
            }

            this.setProgressValues();
        }
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
