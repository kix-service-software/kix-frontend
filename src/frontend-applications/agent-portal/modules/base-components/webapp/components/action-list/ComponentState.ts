/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAction } from '../../../../../modules/base-components/webapp/core/IAction';

export class ComponentState {

    public constructor(
        public actionList: IAction[] = [],
        public listDefault: IAction[] = [],
        public listExpansion: IAction[] = [],
        public showListExpansion: boolean = false,
        public keepShow: boolean = false,
        public displayText: boolean = true,
        public prepared: boolean = false
    ) { }
}
