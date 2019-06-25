import { ISocketNamespaceRegistryExtension } from "../../core/extensions";
import { NotificationNamespace } from "../../socket-namespaces/Namespace";
import { AuthenticationNamespace } from "../../socket-namespaces/AuthenticationNamespace";
import { KIXObjectNamespace } from "../../socket-namespaces/KIXObjectNamespace";
import { MainMenuNamespace } from "../../socket-namespaces/MainMenuNamespace";
import { AgentNamespace } from "../../socket-namespaces";
import { ContextNamespace } from "../../socket-namespaces/ContextNamespace";
import { TicketNamespace } from "../../socket-namespaces/TicketNamespace";
import { KIXModuleNamespace } from "../../socket-namespaces/KIXModuleNamespace";
import { NotesNamespace } from "../../socket-namespaces/NotesNamespace";
import { AdministrationNamespace } from "../../socket-namespaces/AdministrationNamespace";

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
            KIXModuleNamespace.getInstance(),
            AdministrationNamespace.getInstance()
        ];
    }

}

module.exports = (data, host, options) => {
    return new NamespaceRegistry();
};
