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
import { MFANamespace } from './server/MFANamespace';


export class Extension extends KIXExtension implements ISocketNamespaceRegistryExtension {

    public getNamespaceClasses(): any[] {
        return [
            MFANamespace.getInstance()
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
