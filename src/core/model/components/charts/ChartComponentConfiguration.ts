/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration, ConfigurationType } from "../../configuration";
import { ChartConfiguration } from "chart.js";

export class ChartComponentConfiguration implements IConfiguration {

    public constructor(
        public id: string,
        public name: string,
        public type: ConfigurationType | string,
        public chartConfiguration: ChartConfiguration
    ) { }

}
