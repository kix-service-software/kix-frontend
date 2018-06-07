import { ContextService } from "@kix/core/dist/browser/context";
import { NotesEditAction } from "./NotesEditAction";
import { ComponentState } from './ComponentState';

export class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.state.actions = [new NotesEditAction(this)];
    }

    private valueChanged(value): void {
        // speichern
    }

    public showEditor() {
        this.state.editorActive = true;
    }

    public hideEditor() {
        this.state.editorActive = false;
    }

    public saveEditorValue() {
        this.hideEditor();
    }

}

module.exports = Component;
