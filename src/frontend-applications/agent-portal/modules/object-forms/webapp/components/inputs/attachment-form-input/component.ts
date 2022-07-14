/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

class Component extends AbstractMarkoComponent<ComponentState> {

    private formValue: ArticleAttachmentFormValue;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue = input.formValue;
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.state.value = this.formValue?.value;
        this.state.readonly = this.formValue.readonly;
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

    public valueChanged(value: Array<Attachment | File>): void {
        this.state.value = value;
        this.formValue.setObjectValue(this.state.value);
    }

}

module.exports = Component;