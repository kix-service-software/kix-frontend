/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public compareWidget: WidgetConfiguration = null,
        public title: string = null
    ) {
        super();
    }

}
