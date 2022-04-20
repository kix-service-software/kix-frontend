/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { Row } from '../../../../model/Row';

export class ComponentState {

    public constructor(
        public rows: Row[] = [],
        public ready: boolean = false,
        public loading: boolean = false,
        public rowKey: string = IdService.generateDateBasedId()
    ) { }
}
