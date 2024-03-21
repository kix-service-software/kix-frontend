/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public columns: IColumnConfiguration[] = [],
        public propertyTreeId: string = IdService.generateDateBasedId('propertyTree'),
        public dependencyTreeId: string = IdService.generateDateBasedId('dependencyTree'),
        public loading: boolean = false,
        public columnNames: any = {},
        public columnDependencyNames: any = {}
    ) {
        super();
    }
}
