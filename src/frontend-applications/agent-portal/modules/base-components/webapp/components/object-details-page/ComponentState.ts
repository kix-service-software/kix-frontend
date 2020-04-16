/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredWidget } from "../../../../../model/configuration/ConfiguredWidget";
import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public lanes: ConfiguredWidget[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public actions: AbstractAction[] = [],
        public error: any = null,
        public title: string = '',
        public loading: boolean = true
    ) { }
}
