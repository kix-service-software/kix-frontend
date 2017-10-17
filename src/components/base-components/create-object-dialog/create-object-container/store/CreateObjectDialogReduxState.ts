import { CreateDialog } from '@kix/core/dist/model/client';
import { PersonalSettings } from '@kix/core';

export class CreateObjectDialogReduxState {

    public socketListener: SocketIO.Server = null;

    public createDialogs: CreateDialog[] = [];

}
