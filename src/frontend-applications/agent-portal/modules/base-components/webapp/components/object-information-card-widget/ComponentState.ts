/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { InformationRowConfiguration } from './ObjectInformationCardConfiguration';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public avatar: Array<ObjectIcon | string> = [],
        public information: InformationRowConfiguration[] = [],
        public templates: any = {},
        public valuesReady: boolean = false,
        public widgetType: WidgetType = null,
    ) {
        super();
    }

}
