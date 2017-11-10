import { PersonalSettingsSocketListener } from './../../socket/PersonalSettingsSocketListener';
import { StateAction, PersonalSettings } from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './PersonalSettingsAction';

export default (store: any, personalSettings: PersonalSettings) => {

    const payload = new Promise((resolve, reject) => {
        const socketListener: PersonalSettingsSocketListener = store.getState().socketListener;
        // socketListener.savePersonalSettings(personalSettings);
    });

    return new StateAction(PersonalSettingsAction.SAVE_PERSONAL_SETTINGS, payload);
};
