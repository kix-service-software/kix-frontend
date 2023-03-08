/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        public NotificationURL: string,
        public NotificationInterval: number,
        public Authorization: string = null,
        public Translations: PODefinition[] = [],
        public SysConfigOptionDefinitions: SysConfigOptionDefinition[] = [],
        public Requires: any[] = [],
        public Plugins: any[] = [],
        public Requesting?: any
    ) {
        super();
    }

}
