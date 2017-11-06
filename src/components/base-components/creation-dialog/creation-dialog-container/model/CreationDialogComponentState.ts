import { CreationDialog } from '@kix/core/dist/model/client';

export class CreationDialogComponentState {

    public creationDialogs: CreationDialog[] = [];

    public currentDialog: CreationDialog = null;

    public closeDialogChecked: boolean = false;

}
