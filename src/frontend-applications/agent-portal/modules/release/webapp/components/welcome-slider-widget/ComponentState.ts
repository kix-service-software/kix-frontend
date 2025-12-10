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
            new KIXReleaseVersion('v36 - Release Notes ', 'https://forum.kixdesk.com/index.php?topic=13208.0 '),
            new KIXReleaseVersion('v35.1 - Release Notes ', 'https://forum.kixdesk.com/index.php?topic=12911.0'),
            new KIXReleaseVersion('v35 - Release Notes ', 'https://forum.kixdesk.com/index.php?topic=12783.0'),
        ],
        public baseRoute: string = ''
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
