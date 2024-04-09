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
            new KIXReleaseVersion('v31 - Feature-Liste KIX18 v31 ', 'https://forum.kixdesk.com/index.php?topic=12133.0'),
            new KIXReleaseVersion('v30 - Feature-Liste KIX18 v30 ', 'https://forum.kixdesk.com/index.php?topic=12079.0'),
            new KIXReleaseVersion('v29 - Feature-Liste KIX18 v29', 'https://forum.kixdesk.com/index.php?topic=12042.0')
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
