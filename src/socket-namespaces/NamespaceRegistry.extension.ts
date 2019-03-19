import { ISocketNamespaceRegistryExtension } from '../core/extensions';
import { AgentNamespace } from './AgentNamespace';
import { ContextNamespace } from './ContextNamespace';
import { MainMenuNamespace } from './MainMenuNamespace';
import { TicketNamespace } from './TicketNamespace';
import { KIXObjectNamespace } from './KIXObjectNamespace';
import { NotesNamespace } from './NotesNamespace';
import { KIXModuleNamespace } from './KIXModuleNamespace';
import { AuthenticationNamespace } from './AuthenticationNamespace';
import { NotificationNamespace } from './NotificationNamespace';

export class NamespaceRegistry implements ISocketNamespaceRegistryExtension {

    public getNamespaceClasses(): any[] {
        return [
            NotificationNamespace.getInstance(),
            AuthenticationNamespace.getInstance(),
            AgentNamespace.getInstance(),
            ContextNamespace.getInstance(),
            KIXObjectNamespace.getInstance(),
            MainMenuNamespace.getInstance(),
            TicketNamespace.getInstance(),
            NotesNamespace.getInstance(),
            KIXModuleNamespace.getInstance()
        ];
    }

}

module.exports = (data, host, options) => {
    return new NamespaceRegistry();
};
