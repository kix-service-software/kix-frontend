/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumnConfiguration } from './IColumnConfiguration';
import { ConfigurationType } from './ConfigurationType';
import { DataType } from '../DataType';

export class DefaultColumnConfiguration implements IColumnConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType = ConfigurationType.TableColumn,
        public property: string,
        public showText: boolean = true,
        public showIcon: boolean = true,
        public showColumnTitle: boolean = true,
        public showColumnIcon: boolean = false,
        public size: number = 100,
        public sortable: boolean = true,
        public filterable: boolean = false,
        public hasListFilter: boolean = false,
        public dataType: DataType = DataType.STRING,
        public resizable: boolean = true,
        public componentId: string = null,
        public defaultText: string = null,
        public translatable: boolean = true,
        public titleTranslatable: boolean = true,
        public useObjectServiceForFilter: boolean = false,
        public valid: boolean = true,
    ) {
    }
}
