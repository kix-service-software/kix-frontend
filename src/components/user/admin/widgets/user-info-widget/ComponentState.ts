/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState, AbstractAction, User } from "../../../../../core/model";
import { UserLabelProvider } from "../../../../../core/browser/user";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public labelProvider: UserLabelProvider = null,
        public actions: AbstractAction[] = [],
        public user: User = null
    ) {
        super();
    }

}
