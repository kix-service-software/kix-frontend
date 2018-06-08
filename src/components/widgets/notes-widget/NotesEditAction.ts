import { AbstractAction } from "@kix/core/dist/model";
import { Component } from './component';

export class NotesEditAction extends AbstractAction {

    public constructor(public component: Component) {
        super();
        this.initAction();
    }

    public initAction(): void {
        this.text = "Bearbeiten";
        this.icon = "kix-icon-edit";
        this.displayText = false;
    }

    public run(): void {
        this.component.setEditorActive();
    }
}
