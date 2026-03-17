/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public frameId: string = IdService.generateDateBasedId('frame-'),
        public calculateHeight: boolean = false,
        public extraSpace: number = undefined,
        public sandboxAttributes: string[] = [
            'allow-same-origin',
            'allow-same-site-none-cookies',
            'allow-popups',
            'allow-top-navigation'
        ],
        public removeScrolling: boolean = false
    ) {
        super();
    }

}