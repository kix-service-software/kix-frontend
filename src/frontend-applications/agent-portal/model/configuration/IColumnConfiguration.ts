/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
    rtl: boolean;

}
