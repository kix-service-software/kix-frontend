import { AbstractAction } from "../../../core/model";
import { Component } from './component';

export class NotesEditAction extends AbstractAction {

    public constructor(public component: Component) {
        super();
        this.initAction();
    }

    public initAction(): void {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(event: any): Promise<void> {
        this.component.setEditorActive();
    }
}
