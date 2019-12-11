/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from "../../../../../../model/configuration/WidgetConfiguration";

export class ComponentState {

    public constructor(
        public show: boolean = false,
        public dialogHint: string = '',
        public isLoading: boolean = false,
        public loadingHint: string = '',
        public contextId: string = null,
        public showClose: boolean = false,
        public time: number = null,
        public cancelCallback: () => void = null,
        public dialogWidgets: WidgetConfiguration[] = []
    ) { }

}