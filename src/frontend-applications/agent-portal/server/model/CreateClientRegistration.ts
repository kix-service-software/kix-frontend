/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../../../../server/model/rest/RequestObject';
import { SysConfigOptionDefinition } from '../../modules/sysconfig/model/SysConfigOptionDefinition';
import { PODefinition } from './PODefinition';


export class CreateClientRegistration extends RequestObject {

    public constructor(
        public ClientID: string,
        public Translations: PODefinition[] = [],
        public SysConfigOptionDefinitions: SysConfigOptionDefinition[] = [],
        public Requires: any[] = [],
        public Plugins: any[] = [],
        public Requesting?: any
    ) {
        super();
    }

}
