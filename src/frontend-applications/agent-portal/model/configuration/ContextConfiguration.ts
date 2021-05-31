/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from './IConfiguration';
import { ConfigurationType } from './ConfigurationType';
import { ConfiguredWidget } from './ConfiguredWidget';
import { ConfiguredDialogWidget } from './ConfiguredDialogWidget';

export class ContextConfiguration implements IConfiguration {

        public constructor(
                public id: string,
                public name: string,
                public type: string | ConfigurationType,
                public contextId: string,
                public sidebars: ConfiguredWidget[] = [],
                public explorer: ConfiguredWidget[] = [],
                public lanes: ConfiguredWidget[] = [],
                public content: ConfiguredWidget[] = [],
                public generalActions: string[] = [],
                public actions: string[] = [],
                public overlays: ConfiguredWidget[] = [],
                public others: ConfiguredWidget[] = [],
                public dialogs: ConfiguredDialogWidget[] = [],
                public customizable: boolean = false
        ) { }

}
