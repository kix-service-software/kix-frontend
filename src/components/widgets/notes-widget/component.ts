import { ContextService } from "@kix/core/dist/browser/context";
import { NotesService } from "@kix/core/dist/browser/notes";
import { NotesEditAction } from "./NotesEditAction";
import { ComponentState } from './ComponentState';

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
        const context = ContextService.getInstance().getContext(this.state.contextType);
        this.state.contextId = context.id;
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.state.actions = [new NotesEditAction(this)];
        this.state.value = await NotesService.getInstance().loadNotes(this.state.contextId);
        this.editorValue = this.state.value;
    }

    private valueChanged(value): void {
        this.editorValue = value;
    }

    // public for use in action
    public setEditorActive() {
        this.state.editorActive = true;
    }

    private cancelEditor() {
        this.state.editorActive = false;
    }

    private submitEditor() {
        setTimeout(() => {
            this.state.value = this.editorValue;
            this.state.editorActive = false;
            NotesService.getInstance().saveNotes(this.state.contextId, this.state.value);
        }, 200);
    }

}

module.exports = Component;
