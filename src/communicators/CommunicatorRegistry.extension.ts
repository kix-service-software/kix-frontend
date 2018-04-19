import { ApplicationCommunicator } from './ApplicationCommunicator';
import { ICommunicatorRegistryExtension } from '@kix/core/dist/extensions';
import { AuthenticationCommunicator } from '.';
import { ConfigurationCommunicatior } from './ConfigurationCommunicator';
import { ContextCommunicator } from './ContextCommunicator';
import { IconCommunicator } from './IconCommunicator';
import { MainMenuCommunicator } from './MainMenuCommunicator';
import { TicketCommunicator } from './TicketCommunicator';
import { ContactCommunicator } from './ContactCommunicator';
import { CustomerCommunicator } from './CustomerCommunicator';

export class CommunicatorRegistry implements ICommunicatorRegistryExtension {

    public getCommunicatorClasses(): any[] {
        return [
            ApplicationCommunicator,
            AuthenticationCommunicator,
            ConfigurationCommunicatior,
            ContactCommunicator,
            ContextCommunicator,
            CustomerCommunicator,
            IconCommunicator,
            MainMenuCommunicator,
            TicketCommunicator
        ];
    }

}

module.exports = (data, host, options) => {
    return new CommunicatorRegistry();
};
