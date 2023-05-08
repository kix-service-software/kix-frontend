/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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

        public application: string = 'agent-portal';

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
                public customizable: boolean = false,
                public valid: boolean = true,
        ) { }

}
