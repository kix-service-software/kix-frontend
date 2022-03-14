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
import { ConfigurationDefinition } from './ConfigurationDefinition';
import { ObjectIcon } from '../../modules/icon/model/ObjectIcon';

export class WidgetConfiguration implements IConfiguration {

    public instanceId: string;

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public widgetId: string,
        public title: string,
        public actions: string[],
        public subConfigurationDefinition?: ConfigurationDefinition,
        public configuration?: IConfiguration,
        public minimized: boolean = false,
        public minimizable: boolean = true,
        public icon: string | ObjectIcon = '',
        public contextDependent: boolean = false,
        public contextObjectDependent: boolean = false,
        public formDependent: boolean = false,
        public formDependencyProperties: string[] = []
    ) { }

}
