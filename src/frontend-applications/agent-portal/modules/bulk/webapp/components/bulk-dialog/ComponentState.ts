/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { BulkManager } from '../../core/BulkManager';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public bulkManager: BulkManager = null,
        public title: string = 'Translatable#Bulk Action',
        public icon: ObjectIcon | string = 'kix-icon-gear'
    ) { }

}
