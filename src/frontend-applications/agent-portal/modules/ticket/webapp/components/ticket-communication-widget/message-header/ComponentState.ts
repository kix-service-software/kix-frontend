/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../base-components/webapp/core/AbstractComponentState';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { Article } from '../../../../model/Article';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public article: Article = null,
        public attachmentCount: number = 0,
        public channelIcon: ObjectIcon | string = null,
        public createTimeString: string = null,
        public channelTooltip: string = '',
        public timeUnits: string = null,
        public changeTitle: string = null,
        public smimeSignedIcons: Array<ObjectIcon | string> = [],
        public smimeSignedTooltip: string = null,
        public smimeEncryptedIcon: ObjectIcon | string = null,
        public smimeEncryptedTooltip: string = null,
        public smimeDecrypted: boolean = true
    ) {
        super();
    }

}
