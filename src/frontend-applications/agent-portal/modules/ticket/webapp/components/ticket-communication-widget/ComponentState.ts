/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../base-components/webapp/core/WidgetComponentState';
import { Article } from '../../../model/Article';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public articles: Article[] = [],
        public widgetTitle: string = '',
        public newestArticleId: number = null,
        public expanded: boolean = false,
        public activeUnreadAction: boolean = false,
        public selectedCompactView: boolean = false,
        public collapseAll: boolean = false
    ) {
        super();
    }

}
