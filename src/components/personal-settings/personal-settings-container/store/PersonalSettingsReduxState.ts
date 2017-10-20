import { PersonalSettings } from '@kix/core';

export class PersonalSettingsReduxState {

    public personalSettings: PersonalSettings[] = [];

    public socketListener: SocketIO.Server = null;

}
