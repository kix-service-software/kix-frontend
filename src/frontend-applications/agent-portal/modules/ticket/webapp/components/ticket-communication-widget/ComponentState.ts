/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectInformationCardConfiguration } from '../../../../base-components/webapp/components/object-information-card-widget/ObjectInformationCardConfiguration';
import { WidgetComponentState } from '../../../../base-components/webapp/core/WidgetComponentState';
import { Article } from '../../../model/Article';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public articleIds: number[] = [],
        public widgetTitle: string = '',
        public newestArticleId: number = null,
        public expanded: boolean = false,
        public activeUnreadAction: boolean = false,
        public selectedCompactView: boolean = false,
        public collapseAll: boolean = false,
        public informationConfig: ObjectInformationCardConfiguration = null
    ) {
        super();
    }

}
