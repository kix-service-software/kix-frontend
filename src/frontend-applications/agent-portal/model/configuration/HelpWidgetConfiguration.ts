/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from './IConfiguration';
import { ConfigurationType } from './ConfigurationType';

export class HelpWidgetConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public helpText: string,
        public links: Array<[string, string]>,
        public valid: boolean = true,
    ) { }
}
