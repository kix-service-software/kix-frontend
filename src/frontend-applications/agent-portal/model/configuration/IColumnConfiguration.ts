/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DataType } from '../DataType';
import { IConfiguration } from './IConfiguration';

export interface IColumnConfiguration extends IConfiguration {

    property: string;
    showText: boolean;
    showIcon: boolean;
    dataType: DataType;
    showColumnTitle: boolean;
    showColumnIcon: boolean;
    size: number;
    sortable: boolean;
    filterable: boolean;
    hasListFilter: boolean;
    resizable: boolean;
    componentId: string;
    defaultText: string;
    translatable: boolean;
    titleTranslatable: boolean;
    useObjectServiceForFilter: boolean;

}
