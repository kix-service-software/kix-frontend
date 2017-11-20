import { PersonalSettingsSocketListener } from './../../socket/PersonalSettingsSocketListener';
import { PersonalSettings, PersonalSettingsConfiguration } from '@kix/core/dist/model';
import { PersonalSettingsAction } from './PersonalSettingsAction';
import { StateAction } from '@kix/core/dist/browser/StateAction';

export default (store: any, personalSettings: PersonalSettingsConfiguration[]) => {

    const payload = new Promise(async (resolve, reject) => {
        const socketListener: PersonalSettingsSocketListener = store.getState().socketListener;
        await socketListener.savePersonalSettings(personalSettings);
        resolve();
    });

    return new StateAction(PersonalSettingsAction.SAVE_PERSONAL_SETTINGS, payload);
};
