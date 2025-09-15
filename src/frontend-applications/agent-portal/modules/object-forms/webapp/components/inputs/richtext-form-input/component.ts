/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentPortalConfiguration } from '../../../../../../model/configuration/AgentPortalConfiguration';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { KIXModulesService } from '../../../../../base-components/webapp/core/KIXModulesService';
import { SysConfigService } from '../../../../../sysconfig/webapp/core';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { RichTextFormValue } from '../../../../model/FormValues/RichTextFormValue';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {
    private bindingIds: string[] = [];
    private formValue: RichTextFormValue;
    private changeTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {

        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
        }

        this.update();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        await this.applyEditorConfiguration();
        this.state.noImages = this.formValue?.noImages;
        this.state.prepared = true;
    }

    private async applyEditorConfiguration(): Promise<void> {
        const validEditors = ['tiptap', 'quill', 'ckeditor5'];

        const apConfig = await SysConfigService.getInstance().getPortalConfiguration<AgentPortalConfiguration>();
        const rawType = apConfig?.editorType;
        let editorType = rawType?.toLowerCase() || 'ckeditor5';

        if (!validEditors.includes(editorType)) {
            console.warn(`[AgentPortal] Invalid editorType "${editorType}". Falling back to "ckeditor5".`);
            editorType = 'ckeditor5';
        }

        let selectedEditorId = `${editorType}-editor`;

        if (editorType === 'ckeditor5') {
            selectedEditorId = 'editor';
        }

        const template = KIXModulesService.getComponentTemplate(selectedEditorId);

        if (!template) {
            console.error(`[AgentPortal] Template for "${selectedEditorId}" not found.`);
            return;
        }

        this.state.editorTemplate = template;
    }

    private async update(): Promise<void> {
        this.bindingIds = [];

        if (!this.formValue) return;

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.VALUE,
                async (formValue: RichTextFormValue) => {
                    this.state.currentValue = formValue.value;
                    this.state.externallyUpdated = formValue.isExternallyUpdated();
                    formValue.setExternallyUpdatedFalse();
                }
            )
        );

        this.bindingIds.push(
            this.formValue.addPropertyBinding(
                FormValueProperty.READ_ONLY,
                (formValue: ObjectFormValue) => {
                    this.state.readonly = formValue.readonly;
                }
            )
        );

        this.state.currentValue = this.formValue?.value;
        this.state.readonly = this.formValue?.readonly;
    }

    public async onDestroy(): Promise<void> {
        if (this.bindingIds?.length && this.formValue) {
            this.formValue.removePropertyBinding(this.bindingIds);
        }
    }

    public valueChanged(value: string): void {
        this.formValue.dirty = true;
        if (this.changeTimeout) {
            window.clearTimeout(this.changeTimeout);
        }

        this.changeTimeout = setTimeout(async () => {
            await this.formValue.setFormValue(value);
            this.formValue.dirty = false;
        }, 500);
    }

}

module.exports = Component;
