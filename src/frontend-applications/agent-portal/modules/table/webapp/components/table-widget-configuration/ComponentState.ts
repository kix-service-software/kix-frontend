/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public tableConfigurationTemplate: any = null,
        public configuration: TableWidgetConfiguration = null,
        public sortTreeId: string = IdService.generateDateBasedId(),
        public isDESC: boolean = false,
        public prepared: boolean = false
    ) {
        super();
    }

}
