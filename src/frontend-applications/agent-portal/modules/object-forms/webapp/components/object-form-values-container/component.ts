/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';
import { ComponentState } from './ComponentState';
import { GroupRowLayout } from '../object-form-group/GroupRowLayout';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'object-form-values-container');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.formValues = input.formValues || [];
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.prepared = true;
    }

    public getKey(): string {
        return IdService.generateDateBasedId();
    }

    public getColumnClasses(column: GroupRowLayout): string {
        let classes = [];

        if (column?.colSM > 0) {
            classes.push('col-sm-' + (column.colSM < 3 ? 3 : column.colSM));
        }

        if (column?.colMD > 0) {
            classes.push('col-md-' + (column.colMD < 3 ? 3 : column.colMD));
        }

        if (column?.colLG > 0) {
            classes.push('col-lg-' + (column.colLG < 3 ? 3 : column.colLG));
        }

        if (!classes.length) {
            classes.push('col-12');
        }

        return classes.join(' ');
    }

    public getFormValue(field: FormFieldConfiguration): ObjectFormValue {
        return this.state.formValues.find((fv) => fv.fieldId === field.id);
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;