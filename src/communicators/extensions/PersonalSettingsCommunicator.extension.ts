import { PersonalSettingsCommunicator } from '../PersonalSettingsCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class PersonalSettingsCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return PersonalSettingsCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new PersonalSettingsCommunicatorExtension();
};
