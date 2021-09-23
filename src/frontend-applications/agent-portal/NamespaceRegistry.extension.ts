/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketNamespaceRegistryExtension } from './server/extensions/ISocketNamespaceRegistryExtension';
import { NotificationNamespace } from './server/socket-namespaces/NotificationNamespace';
import { AuthenticationNamespace } from './server/socket-namespaces/AuthenticationNamespace';
import { ContextNamespace } from './server/socket-namespaces/ContextNamespace';
import { KIXModuleNamespace } from './server/socket-namespaces/KIXModuleNamespace';
import { KIXObjectNamespace } from './server/socket-namespaces/KIXObjectNamespace';
import { KIXExtension } from '../../server/model/KIXExtension';

export class Extension extends KIXExtension implements ISocketNamespaceRegistryExtension {

    public getNamespaceClasses(): any[] {
        return [
            NotificationNamespace.getInstance(),
            AuthenticationNamespace.getInstance(),
            ContextNamespace.getInstance(),
            KIXModuleNamespace.getInstance(),
            KIXObjectNamespace.getInstance()
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
