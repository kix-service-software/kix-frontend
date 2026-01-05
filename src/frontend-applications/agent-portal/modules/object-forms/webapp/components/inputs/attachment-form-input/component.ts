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
import { Attachment } from '../../../../../../model/kix/Attachment';
import { ArticleAttachmentFormValue } from '../../../../../ticket/webapp/core/form/form-values/ArticleAttachmentFormValue';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { WindowListener } from '../../../../../base-components/webapp/core/WindowListener';
import { ObjectFormEventData } from '../../../../model/ObjectFormEventData';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: ArticleAttachmentFormValue;

    public onCreate(input: any): void {
        super.onCreate(input, 'inputs/attachment-form-input');
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
        await super.onMount();

        this.state.prepared = true;

        super.registerEventSubscriber(
            function (data: ObjectFormEventData, eventId: string): void {
                if (this.context?.instanceId === data.contextInstanceId) {
                    if (data.blocked) {
                        this.state.readonly = true;
                    } else {
                        this.state.readonly = this.formValue.readonly;
                    }
                }
            },
            [ObjectFormEvent.BLOCK_FORM]
        );

        WindowListener.getInstance().addUnloadTask(
            `${this.formValue.instanceId}`, this.formValue.destroy.bind(this.formValue)
        );
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();

        if (this.bindingIds?.length && this.formValue) {
            this.formValue.removePropertyBinding(this.bindingIds);
        }

        WindowListener.getInstance().removeUnloadTask(`${this.formValue.instanceId}`);
    }

    public valueChanged(value: Array<Attachment | File>): void {
        this.state.value = value;
        this.formValue.setFormValue(this.state.value);
    }

}

module.exports = Component;