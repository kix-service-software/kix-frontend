import { PersonalSettings } from '@kix/core/dist/model/client';

export class PersonalSettingsComponentState {

    public personalSettings: PersonalSettings[] = [];

    public socketListener: SocketIO.Server = null;

    public currentSetting: PersonalSettings = null;

}
