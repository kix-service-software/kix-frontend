/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { StringContent } from "../../../../../modules/base-components/webapp/core/StringContent";
import { ComponentContent } from "../../../../../modules/base-components/webapp/core/ComponentContent";

export class ComponentState {

    public constructor(
        public show: boolean = false,
        public isHintOverlay: boolean = false,
        public content: StringContent<any> | ComponentContent<any> = null,
        public instanceId: string = null,
        public title: string = null,
        public large: boolean = false
    ) { }

}
