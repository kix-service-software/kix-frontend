/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { Notification } from '../../../model/Notification';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public notification: Notification = null,
        public actions: AbstractAction[] = [],
        public properties: string[] = [],
        public eventLabels: Label[] = []
    ) {
        super();
    }

}
