import { PersonalSettingsSocketListener } from './../../socket/PersonalSettingsSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { PersonalSettingsAction } from './PersonalSettingsAction';

export default () => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new PersonalSettingsSocketListener();
        resolve({ socketListener });
    });
    return new StateAction(PersonalSettingsAction.PERSONAL_SETTINGS_INITIALIZE, payload);
};
