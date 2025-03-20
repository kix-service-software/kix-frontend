/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Article } from '../../../model/Article';
import { Attachment } from '../../../../../model/kix/Attachment';
import { DisplayImageDescription } from '../../../../base-components/webapp/core/DisplayImageDescription';

export class ComponentState {

    public article: Article = null;
    public attachments: Attachment[] = [];
    public images: DisplayImageDescription[] = [];

}
