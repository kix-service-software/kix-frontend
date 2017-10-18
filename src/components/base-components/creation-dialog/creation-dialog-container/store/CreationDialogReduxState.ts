import { CreationDialog } from '@kix/core/dist/model/client';
import { PersonalSettings } from '@kix/core';

export class CreationDialogReduxState {

    public socketListener: SocketIO.Server = null;

    public creationDialogs: CreationDialog[] = [];

}
