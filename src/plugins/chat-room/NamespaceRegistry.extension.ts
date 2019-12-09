/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ISocketNamespaceRegistryExtension
} from "../../frontend-applications/agent-portal/server/extensions/ISocketNamespaceRegistryExtension";
import { ChatNamespace } from "./server/ChatNamespace";

export class NamespaceRegistry implements ISocketNamespaceRegistryExtension {

    public getNamespaceClasses(): any[] {
        return [
            ChatNamespace.getInstance()
        ];
    }

}

module.exports = (data, host, options) => {
    return new NamespaceRegistry();
};
