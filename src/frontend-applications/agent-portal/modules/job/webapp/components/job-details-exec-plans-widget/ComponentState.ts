/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';


export class ComponentState extends WidgetComponentState {

    public constructor(
        public prepared: boolean = false,
        public timeLabels: Label[] = [],
        public weekdayLabels: Label[] = [],
        public eventLabels: Label[] = [],
        public showTimeBased: boolean = false,
        public showEventBased: boolean = false
    ) {
        super();
    }

}
