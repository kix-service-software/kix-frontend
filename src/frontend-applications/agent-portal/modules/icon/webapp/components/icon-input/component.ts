/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ObjectIcon } from '../../../model/ObjectIcon';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Context } from '../../../../../model/Context';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';

class Component extends FormInputComponent<any, ComponentState> {

    private context: Context;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        await super.onMount();
        await this.setFieldConfiguration();
        await this.setCurrentValue();
    }

    private async setFieldConfiguration(): Promise<void> {
        const option = this.state.field?.options?.find((o) => o.option === 'ICON_LIBRARY');
        if (option) {
            this.state.fileUpload = !option?.value;
            this.state.libraryEnabled = option?.value;
        }
    }

    public async setCurrentValue(): Promise<void> {
        const value = await this.getFormValue();
        this.state.icon = value?.value;
    }

    private async getFormValue(): Promise<FormFieldValue> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        const value = formInstance?.getFormFieldValue<string | ObjectIcon>(this.state.field?.instanceId);
        return value;
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
        this.state.icon = icon;
        super.provideValue(icon);
    }
}

module.exports = Component;
