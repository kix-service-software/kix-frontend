/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../model/IdService';
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { IAction } from '../webapp/core/IAction';

export class ActionGroup {

    public key: string;

    public constructor(
        public actions: IAction[] = null,
        public rank: number = null,
        public text: string = null,
        public icon: string | ObjectIcon = null,
    ) {
        this.key = IdService.generateDateBasedId();
    }

}