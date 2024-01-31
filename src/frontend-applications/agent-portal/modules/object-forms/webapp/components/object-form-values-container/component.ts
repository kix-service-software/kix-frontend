/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../model/ObjectFormValueMapper';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private parentFormValue: ObjectFormValue;
    private objectFormValueMapper: ObjectFormValueMapper;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.parentFormValue = input.parent || null;
        this.state.formValues = input.formValues || [];
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formhandler = await context.getFormManager().getObjectFormHandler();
        this.objectFormValueMapper = formhandler?.objectFormValueMapper;
        this.state.prepared = true;
    }

    public isSorted(formValue: ObjectFormValue): boolean {
        const property = (formValue as any).dfName
            ? `DynamicFields.${(formValue as any).dfName}`
            : formValue?.property;
        const isSorted = this.objectFormValueMapper?.isSortedFormValue(property) && formValue.isSortable;
        return isSorted && this.parentFormValue !== null;
    }

}

module.exports = Component;