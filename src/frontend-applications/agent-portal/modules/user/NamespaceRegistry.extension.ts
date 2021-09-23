/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ISocketNamespaceRegistryExtension } from '../../server/extensions/ISocketNamespaceRegistryExtension';
import { AgentNamespace } from './server/AgentNamespace';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements ISocketNamespaceRegistryExtension {

    public getNamespaceClasses(): any[] {
        return [
            AgentNamespace.getInstance()
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
