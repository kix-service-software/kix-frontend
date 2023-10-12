/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SliderContent } from './SliderContent';
import { IConfiguration } from '../../../model/configuration/IConfiguration';
import { ConfigurationType } from '../../../model/configuration/ConfigurationType';

export class SliderWidgetConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public sliderList: SliderContent[] = [],
        public valid: boolean = true,
    ) { }
}
