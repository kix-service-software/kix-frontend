/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contextInstanceId = input.contextInstanceId;
        this.state.formValues = input.formValues || [];
    }

    public async onMount(): Promise<void> {
        this.state.prepared = true;
    }

    public getKey(): string {
        return IdService.generateDateBasedId();
    }

    public getColumnClasses(column: GroupRowLayout): string {
        let classes = [];

        if (column?.colSM > 0) {
            classes.push('col-sm-' + column.colSM);
        }

        if (column?.colMD > 0) {
            classes.push('col-md-' + column.colMD);
        }

        if (column?.colLG > 0) {
            classes.push('col-lg-' + column.colLG);
        }

        if (!classes.length) {
            classes.push('col-12');
        }

        return classes.join(' ');
    }

    public getFormValue(field: FormFieldConfiguration): ObjectFormValue {
        return this.state.formValues.find((fv) => fv.fieldId === field.id);
    }

}

module.exports = Component;