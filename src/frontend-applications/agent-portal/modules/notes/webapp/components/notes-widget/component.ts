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
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { NotesService } from '../../core/NotesService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public state: ComponentState;
    private editorValue: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
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
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
        this.state.value = await NotesService.getInstance().loadNotes(this.state.contextId);
        this.editorValue = this.state.value;
        this.state.editorReady = true;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
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
        const component = (this as any).getComponent('notes-editor');
        this.state.value = component?.getValue();
        await NotesService.getInstance().saveNotes(this.state.contextId, this.state.value);
        this.state.editorActive = false;
    }

}

module.exports = Component;
