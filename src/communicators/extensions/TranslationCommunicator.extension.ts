import { TranslationCommunicator } from '../TranslationCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class TranslationCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return TranslationCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new TranslationCommunicatorExtension();
};
