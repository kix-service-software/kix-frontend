/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UserLabelProvider } from '../../core/UserLabelProvider';
import { User } from '../../../model/User';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public actions: AbstractAction[] = [],
        public labelProvider: UserLabelProvider = null,
        public user: User = null,
        public queueLabels: Label[] = [],
        public notificationLabels: Label[] = []
    ) {
        super();
    }

}
