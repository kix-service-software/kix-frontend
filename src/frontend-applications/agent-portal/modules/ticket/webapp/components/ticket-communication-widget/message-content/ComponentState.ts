/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Attachment } from '../../../../../../model/kix/Attachment';
import { AbstractAction } from '../../../../../base-components/webapp/core/AbstractAction';
import { AbstractComponentState } from '../../../../../base-components/webapp/core/AbstractComponentState';
import { DisplayImageDescription } from '../../../../../base-components/webapp/core/DisplayImageDescription';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { Article } from '../../../../model/Article';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public title: string = 'message-content Component',
        public article: Article = null,
        public expanded: boolean = false,
        public compactViewExpanded: boolean = false,
        public actions: AbstractAction[] = [],
        public isExternal: boolean = false,
        public contactIcon: ObjectIcon | string = null,
        public shortMessage: string = '',
        public articleTo: string = '',
        public articleCc: string = '',
        public articleAttachments: Attachment[] = [],
        public images: DisplayImageDescription[] = [],
        public show: boolean = false,
        public backgroundColor: string = '#fff',
        public selectedCompactView: boolean = true,
        public fromDisplayName: string = '',
        public showAllAttachments: boolean = false,
        public hasInlineAttachments: boolean = false,
        public loadingContent: boolean = false,
        public showContent: boolean = false,
        public unseen: number = 1,
        public oneColumnLayout: boolean = false,
        public switchAttachmentListTooltip: string = 'Translatable#Switch attachment list layout'
    ) {
        super();
    }

}
