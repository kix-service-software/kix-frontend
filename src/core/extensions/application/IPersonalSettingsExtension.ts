import { PersonalSettings } from '../../model';

export interface IPersonalSettingsExtension {

    getPersonalSettings(): Promise<PersonalSettings>;

}
