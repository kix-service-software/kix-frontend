import { ContextService } from '../../../core/browser/context';
import { NotesService } from '../../../core/browser/notes';
import { NotesEditAction } from './NotesEditAction';
import { ComponentState } from './ComponentState';
import { WidgetService } from '../../../core/browser';

export class Component {

    private state: ComponentState;
    private editorValue: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.contextId = context.getDescriptor().contextId;
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
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

    public setEditorActive() {
        this.state.editorActive = true;
    }

    public cancelEditor() {
        this.state.editorActive = false;
    }

    public submitEditor() {
        setTimeout(() => {
            this.state.value = this.editorValue;
            this.state.editorActive = false;
            NotesService.getInstance().saveNotes(this.state.contextId, this.state.value);
        }, 200);
    }

}

module.exports = Component;
