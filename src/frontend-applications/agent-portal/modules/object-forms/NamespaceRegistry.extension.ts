/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ISocketNamespaceRegistryExtension } from '../../server/extensions/ISocketNamespaceRegistryExtension';
import { SocketNameSpace } from '../../server/socket-namespaces/SocketNameSpace';
import { CommitObjectNamespace } from './server/CommitObjectNamespace';


export class Extension extends KIXExtension implements ISocketNamespaceRegistryExtension {

    public getNamespaceClasses(): SocketNameSpace[] {
        return [
            CommitObjectNamespace.getInstance()
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
