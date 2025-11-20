/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { FormFieldOption } from '../../../../../../model/configuration/FormFieldOption';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { IconFormValue } from '../../../../model/FormValues/IconFormValue';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: IconFormValue;
    private options: FormFieldOption[];

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

    private async update(): Promise<void> {
        this.bindingIds = [];
        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.VALUE, async (formValue: ObjectFormValue) => {
                    this.state.value = formValue.value;
                }
            ),
            this.formValue?.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );

        this.state.readonly = this.formValue?.readonly;
        if (this.formValue?.value) {
            this.state.value = this.formValue.value;
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.fileUpload = this.formValue.fileUploadEnabled;
        this.state.libraryEnabled = this.formValue.libraryEnabled;
    }

    public switchMode(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.fileUpload = !this.state.fileUpload;
    }

    public iconChanged(icon: ObjectIcon | string): void {
        if (typeof icon === 'string') {
            const content = icon;
            icon = new ObjectIcon();
            icon.ContentType = 'text';
            icon.Content = content;
        }
        this.state.value = icon;
        this.formValue.setFormValue(this.state.value);
    }

    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
