/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId(),
        public lanes: Array<[string, any]> = [],
        public contentWidgets: Array<[string, any]> = [],
        public actions: AbstractAction[] = [],
        public error: any = null,
        public title: string = '',
    ) { }
}
