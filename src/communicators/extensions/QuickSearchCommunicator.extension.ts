import { ICommunicatorExtension } from '@kix/core/dist/extensions';

import { QuickSearchCommunicator } from '../QuickSearchCommunicator';

export class QuickSearchCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return QuickSearchCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new QuickSearchCommunicatorExtension();
};
