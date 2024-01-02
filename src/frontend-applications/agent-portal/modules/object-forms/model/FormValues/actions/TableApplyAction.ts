/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldTableFormValue } from '../DynamicFields/DynamicFieldTableFormValue';
import { FormValueAction } from '../FormValueAction';

export class TableApplyAction extends FormValueAction {


    public async initAction(): Promise<void> {
        this.text = 'Translatable#Apply Table';
        this.icon = 'fas fa-check x-small';
    }

    public async canShow(): Promise<boolean> {
        return this.formValue.enabled;
    }

    public canRun(): boolean {
        return this.formValue?.enabled;
    }

    public async run(event: any): Promise<void> {
        this.addInitialTable();
    }

    private addInitialTable(): void {
        (this.formValue as DynamicFieldTableFormValue)?.apply();
    }

}