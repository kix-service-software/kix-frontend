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

import { SysConfigService } from '../../../../../modules/sysconfig/webapp/core';
import { AgentPortalConfiguration } from '../../../../../model/configuration/AgentPortalConfiguration';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        if (!this.state.noImages) {
            const noImagesOption = this.state.field?.options.find((o) => o.option === 'NO_IMAGES');
            if (noImagesOption) {
                this.state.noImages = Boolean(noImagesOption.value);
            }
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.applyEditorConfiguration();
        await this.setCurrentValue();
    }

    private async applyEditorConfiguration(): Promise<void> {
        const validEditors = ['tiptap', 'ckeditor5'];

        let editorType = 'ckeditor5';
        try {
            const apConfig = await SysConfigService.getInstance()
                .getPortalConfiguration<AgentPortalConfiguration>();
            const rawType = apConfig?.editorType;

            editorType = rawType?.toLowerCase() || 'ckeditor5';

            if (!validEditors.includes(editorType)) {
                editorType = 'ckeditor5';
            }
        } catch (e) {
            editorType = 'ckeditor5';
        }

        let selectedEditorId = `${editorType}-editor`;
        if (editorType === 'ckeditor5') {
            selectedEditorId = 'editor';
        }

        const template = KIXModulesService.getComponentTemplate(selectedEditorId);

        if (!template) {
            const fallback = KIXModulesService.getComponentTemplate('editor');
            if (!fallback) {
                return;
            }
            this.state.editorTemplate = fallback;
        } else {
            this.state.editorTemplate = template;
        }

        this.state.prepared = true;
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = this.context?.getFormManager()?.getFormInstance();
        const value = (await formInstance).getFormFieldValue<string>(this.state.field?.instanceId);
        if (value) {
            this.state.currentValue = value.value;
        }
    }

    public valueChanged(value: string): void {
        this.state.currentValue = value || null;
        super.provideValue(this.state.currentValue);
    }
}

module.exports = Component;