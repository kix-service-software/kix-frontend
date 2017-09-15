import { KixSidebarConfiguration } from './../../../../../model/client/components/';
import { StateAction } from '../../../../../model/client/store/StateAction';
import { KixSidebarAction } from './';

export default (configuration: KixSidebarConfiguration) => {
    const payload = new Promise((resolve, reject) => {
        resolve({ configuration });
    });

    return new StateAction(KixSidebarAction.KIX_SIDEBAR_CONFIGURATION_LOADED, payload);
};
