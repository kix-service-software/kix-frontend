/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { NotesEditAction } from './NotesEditAction';
import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { NotesService } from '../../core/NotesService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { SysConfigService } from '../../../../sysconfig/webapp/core';
import { AgentPortalConfiguration } from '../../../../../model/configuration/AgentPortalConfiguration';
import { KIXModulesService } from '../../../../base-components/webapp/core/KIXModulesService';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Submit'
        ]);

        this.state.contextId = this.context?.contextId;
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);
        this.state.actions = [new NotesEditAction(this)];
        this.context.widgetService.registerActions(this.state.instanceId, this.state.actions);
        this.state.value = await NotesService.getInstance().loadNotes(this.state.contextId);

        await this.applyEditorConfiguration();

        this.state.editorReady = true;
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

    }

    public onDestroy(): void {
        this.context.widgetService.unregisterActions(this.state.instanceId);
    }

    public setEditorActive(): void {
        this.state.editorReady = false;
        this.state.editorActive = true;
        setTimeout(() => {
            this.state.editorReady = true;
        }, 20);
    }

    public cancelEditor(): void {
        this.state.editorActive = false;
    }

    public async submitEditor(): Promise<void> {
        await NotesService.getInstance().saveNotes(this.state.contextId, this.state.value);
        this.state.editorActive = false;
    }

    public valueChanged(value: string): void {
        this.state.value = value;
    }

}

module.exports = Component;
