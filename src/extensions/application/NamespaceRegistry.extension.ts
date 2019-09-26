/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketNamespaceRegistryExtension } from "../../core/extensions";
import { AuthenticationNamespace } from "../../socket-namespaces/AuthenticationNamespace";
import { KIXObjectNamespace } from "../../socket-namespaces/KIXObjectNamespace";
import { MainMenuNamespace } from "../../socket-namespaces/MainMenuNamespace";
import { AgentNamespace, NotificationNamespace } from "../../socket-namespaces";
import { ContextNamespace } from "../../socket-namespaces/ContextNamespace";
import { TicketNamespace } from "../../socket-namespaces/TicketNamespace";
import { KIXModuleNamespace } from "../../socket-namespaces/KIXModuleNamespace";
import { NotesNamespace } from "../../socket-namespaces/NotesNamespace";
import { AdministrationNamespace } from "../../socket-namespaces/AdministrationNamespace";
import { SearchNamespace } from "../../socket-namespaces/SearchNamespace";
import { WebformNameSpace } from '../../socket-namespaces/WebformNameSpace';

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
            AdministrationNamespace.getInstance(),
            SearchNamespace.getInstance(),
            WebformNameSpace.getInstance()
        ];
    }

}

module.exports = (data, host, options) => {
    return new NamespaceRegistry();
};
