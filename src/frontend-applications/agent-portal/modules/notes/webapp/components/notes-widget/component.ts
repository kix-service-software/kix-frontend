/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class Component {

    public state: ComponentState;
    private editorValue: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Submit'
        ]);

        const context = ContextService.getInstance().getActiveContext();
        this.state.contextId = context.contextId;
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;
        this.state.actions = [new NotesEditAction(this)];
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
        this.state.value = await NotesService.getInstance().loadNotes(this.state.contextId);
        this.editorValue = this.state.value;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    public valueChanged(value): void {
        this.editorValue = value;
    }

    public setEditorActive(): void {
        this.state.editorActive = true;
    }

    public cancelEditor(): void {
        this.state.editorActive = false;
    }

    public submitEditor(): void {
        setTimeout(() => {
            this.state.value = this.editorValue;
            this.state.editorActive = false;
            NotesService.getInstance().saveNotes(this.state.contextId, this.state.value);
        }, 200);
    }

}

module.exports = Component;
