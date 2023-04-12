/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormValueAction } from '../FormValueAction';

export class TableRemoveFormValueAction extends FormValueAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Remove table';
        this.icon = 'kix-icon-close';
    }

    public async canShow(): Promise<boolean> {
        return this.formValue.enabled && this.formValue.value && this.formValue.value.length > 0;
    }

    public canRun(): boolean {
        return this.formValue?.enabled;
    }

    public async run(event: any): Promise<void> {
        this.removeTable();
    }

    public removeTable(): void {
        this.formValue?.setFormValue(null);
    }

}