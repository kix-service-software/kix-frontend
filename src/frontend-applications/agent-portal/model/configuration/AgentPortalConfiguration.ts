/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../kix/KIXObjectType';
import { IConfiguration } from './IConfiguration';

export class AgentPortalConfiguration implements IConfiguration {

    public static CONFIGURATION_ID = 'agent-portal-configuration';

    public application: string = 'agent-portal';

    public constructor(
        public preloadObjects: Array<KIXObjectType | string> = [],
        public id: string = AgentPortalConfiguration.CONFIGURATION_ID,
        public name: string = 'Agent Portal Configuration',
        public type: string = 'Agent Portal',
        public valid: boolean = true,
    ) { }

}
