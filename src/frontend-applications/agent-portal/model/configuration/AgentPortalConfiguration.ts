/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CKEditorConfiguration } from '../../modules/base-components/model/CKEditorConfiguration';
import { KIXObjectType } from '../kix/KIXObjectType';
import { IConfiguration } from './IConfiguration';

export class AgentPortalConfiguration implements IConfiguration {

        public static CONFIGURATION_ID = 'agent-portal-configuration';

        public application: string = 'agent-portal';

        public constructor(
                public preloadObjects: Array<KIXObjectType | string> = [],
                public defaultPageSize: number = 20,
                public adminRoleIds: number[] = [],
                public id: string = AgentPortalConfiguration.CONFIGURATION_ID,
                public name: string = 'Agent Portal Configuration',
                public type: string = 'Agent Portal',
                public valid: boolean = true,
                public ckEditorConfiguration: CKEditorConfiguration = new CKEditorConfiguration(),
                public minimizeSearchCriteriaWidget: boolean = true
        ) { }

}
