import { WidgetComponentState } from '@kix/core/dist/model/client';

export class NotesComponentState extends WidgetComponentState {

    public editorReadOnly: boolean;

    public constructor() {
        super();
        this.editorReadOnly = false;
    }
}
