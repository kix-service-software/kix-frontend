/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldTableFormValue } from '../DynamicFields/DynamicFieldTableFormValue';
import { FormValueAction } from '../FormValueAction';

export class TableAddFormValueAction extends FormValueAction {


    public async initAction(): Promise<void> {
        this.text = 'Translatable#Add initial table';
        this.icon = 'fas fa-plus x-small';
    }

    public async canShow(): Promise<boolean> {
        return this.formValue.enabled && (!this.formValue.value || this.formValue.value.length === 0);
    }

    public canRun(): boolean {
        return this.formValue?.enabled;
    }

    public async run(event: any): Promise<void> {
        this.addInitialTable();
    }

    private addInitialTable(): void {
        (this.formValue as DynamicFieldTableFormValue)?.addInitialTable();
    }

}