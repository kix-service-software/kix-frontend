/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';


export class ComponentState extends WidgetComponentState {

    public constructor(
        public hasFAQAccess: boolean = false,
        public hasConfigAccess: boolean = false,
        public appleImg: string = 'app-store.png',
        public googleImg: string = 'google-play.png',
        public selfServiceManualLink: string = null,
        public userManualLink: string = null,
        public adminManualLink: string = null,
        public faqIds: number[] = []

    ) {
        super();
    }

}
