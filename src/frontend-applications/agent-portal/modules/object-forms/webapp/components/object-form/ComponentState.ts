/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public prepared: boolean = false,
        public error: string = null,
        public pages: FormPageConfiguration[] = [],
        public carouselId: string = 'Carousel-' + IdService.generateDateBasedId(),
        public configurationMode: boolean = false,
        public contextInstanceId: string = null,
    ) {
        super();
    }

}