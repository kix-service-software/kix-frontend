import { PersonalSettings } from '@kix/core/dist/model';
import { PersonalSettingsAction } from './PersonalSettingsAction';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (personalSettings: PersonalSettings[]) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ personalSettings });
    });

    return new StateAction(PersonalSettingsAction.PERSONAL_SETTINGS_LOADED, payload);
};
