import { PersonalSettings, CreationDialog } from '@kix/core/dist/model';

export class CreationDialogReduxState {

    public socketListener: SocketIO.Server = null;

    public creationDialogs: CreationDialog[] = [];

}
