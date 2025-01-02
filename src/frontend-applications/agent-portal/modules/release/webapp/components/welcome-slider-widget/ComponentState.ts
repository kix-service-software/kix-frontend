/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { SliderContent } from '../../../model/SliderContent';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public sliderList: SliderContent[] = [],
        public activeSliderIndex: number = 0,
        public activeSlider: SliderContent = null,
        public userString: string = '',
        public changeSlider: boolean = false,
        public kixReleaseVersions: KIXReleaseVersion[] = [
            new KIXReleaseVersion('v34 - Feature-Liste KIX18 v34 ', 'https://forum.kixdesk.com/index.php?topic=12539'),
            new KIXReleaseVersion('v33 - Feature-Liste KIX18 v33 ', 'https://forum.kixdesk.com/index.php?topic=12273'),
            new KIXReleaseVersion('v32 - Feature-Liste KIX18 v32 ', 'https://forum.kixdesk.com/index.php?topic=12162')
        ]
    ) {
        super();
    }

}

export class KIXReleaseVersion {
    public constructor(
        public label: string,
        public url: string = '',
    ) { }
}
