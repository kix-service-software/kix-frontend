import { PersonalSettings } from '@kix/core/dist/model';

export class PersonalSettingsReduxState {

    public personalSettings: PersonalSettings[] = [];

    public socketListener: SocketIO.Server = null;

    public saving: boolean = false;

}
