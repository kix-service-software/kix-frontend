/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ReleaseInfo } from '../../../../../model/ReleaseInfo';
import { AbstractComponentState } from '../../core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public kixVersion: string = 'KIX 18',
        public currentUserLogin: string = null,
        public imprintLink: string = null,
        public footerInformation: string[] = []
    ) {
        super();
    }

}
