/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
        public rows: Row[] = null,
        public loadMore: boolean = false,
        public rowKey: string = IdService.generateDateBasedId(),
        public loadMoreButtonId: string = IdService.generateDateBasedId('load-more-button'),
        public canLoadMore: boolean = false
    ) { }
}
