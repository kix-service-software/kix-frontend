import { PersonalSettings } from '@kix/core/dist/model';

export class PersonalSettingsComponentState {

    public personalSettings: PersonalSettings[] = [];

    public currentSetting: PersonalSettings = null;

    public saving: boolean = false;

}
