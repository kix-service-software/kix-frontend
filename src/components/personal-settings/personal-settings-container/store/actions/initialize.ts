import { PersonalSettingsSocketListener } from './../../socket/PersonalSettingsSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './PersonalSettingsAction';

export default (store: any) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new PersonalSettingsSocketListener(store);
        resolve({ socketListener });
    });
    return new StateAction(PersonalSettingsAction.PERSONAL_SETTINGS_INITIALIZE, payload);
};
