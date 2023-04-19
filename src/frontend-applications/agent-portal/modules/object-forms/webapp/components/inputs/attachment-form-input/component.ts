/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { Attachment } from '../../../../../../model/kix/Attachment';
import { ArticleAttachmentFormValue } from '../../../../../ticket/webapp/core/form/form-values/ArticleAttachmentFormValue';
import { FormValueProperty } from '../../../../model/FormValueProperty';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: ArticleAttachmentFormValue;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
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
                FormValueProperty.VALUE, async (formValue: ArticleAttachmentFormValue) => {
                    this.state.value = Array.isArray(formValue.value)
                        ? formValue.value
                        : [formValue.value];
                }
            ),
            this.formValue?.addPropertyBinding(FormValueProperty.READ_ONLY, (formValue: ArticleAttachmentFormValue) => {
                this.state.readonly = formValue.readonly;
            })
        );

        this.state.readonly = this.formValue?.readonly;
        if (Array.isArray(this.formValue?.options)) {
            this.state.options = this.formValue.options;
        }
        if (this.formValue?.value) {
            this.state.value = Array.isArray(this.formValue.value)
                ? this.formValue.value
                : [this.formValue.value];
        }
    }

    public async onMount(): Promise<void> {
        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        if (this.bindingIds?.length && this.formValue) {
            this.formValue.removePropertyBinding(this.bindingIds);
        }
    }

    public valueChanged(value: Array<Attachment | File>): void {
        this.state.value = value;
        this.formValue.setFormValue(this.state.value);
    }

}

module.exports = Component;