/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { ObjectIcon } from '../../../model/ObjectIcon';


export class ComponentState {

    public constructor(
        public icon: string | ObjectIcon = null,
        public base64: boolean = false,
        public content: string = null,
        public contentType: string = null,
        public showUnknown: boolean = false,
        public iconId: string = IdService.generateDateBasedId(),
        public tooltip: string = ''
    ) { }

}
