import { StateAction, PersonalSettings } from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './PersonalSettingsAction';

export default (personalSettings: PersonalSettings[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ personalSettings });
    });

    return new StateAction(PersonalSettingsAction.PERSONAL_SETTINGS_LOADED, payload);
};
