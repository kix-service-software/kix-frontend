/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IChartValue } from './IChartValue';

export class ChartSingleValue implements IChartValue {
    public value: any;

    public constructor(value: any) {
        this.value = value;
    }
}
