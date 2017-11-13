import { PersonalSettingsSocketListener } from './../../socket/PersonalSettingsSocketListener';
import { StateAction, PersonalSettings, PersonalSettingsConfiguration } from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './PersonalSettingsAction';

export default (store: any, personalSettings: PersonalSettingsConfiguration[]) => {

    const payload = new Promise(async (resolve, reject) => {
        const socketListener: PersonalSettingsSocketListener = store.getState().socketListener;
        await socketListener.savePersonalSettings(personalSettings);
        resolve();
    });

    return new StateAction(PersonalSettingsAction.SAVE_PERSONAL_SETTINGS, payload);
};
