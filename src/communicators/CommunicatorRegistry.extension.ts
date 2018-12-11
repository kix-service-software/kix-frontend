import { ICommunicatorRegistryExtension } from '@kix/core/dist/extensions';
import { AuthenticationCommunicator } from '.';
import { ConfigurationCommunicatior } from './ConfigurationCommunicator';
import { ContextCommunicator } from './ContextCommunicator';
import { MainMenuCommunicator } from './MainMenuCommunicator';
import { TicketCommunicator } from './TicketCommunicator';
import { KIXObjectCommunicator } from './KIXObjectCommunicator';
import { NotesCommunicatior } from './NotesCommunicator';
import { KIXModuleCommunicator } from './KIXModuleCommunicator';

export class CommunicatorRegistry implements ICommunicatorRegistryExtension {

    public getCommunicatorClasses(): any[] {
        return [
            AuthenticationCommunicator.getInstance(),
            ConfigurationCommunicatior.getInstance(),
            ContextCommunicator.getInstance(),
            KIXObjectCommunicator.getInstance(),
            MainMenuCommunicator.getInstance(),
            TicketCommunicator.getInstance(),
            NotesCommunicatior.getInstance(),
            KIXModuleCommunicator.getInstance()
        ];
    }

}

module.exports = (data, host, options) => {
    return new CommunicatorRegistry();
};
