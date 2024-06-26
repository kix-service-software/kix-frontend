/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { GraphD3Node } from '../../graph/model/GraphD3Node';

export class CID3Node extends GraphD3Node {

    public constructor(
        public id: string,
        public name: string,
        public classId: number,
        public bgColor?: string,
        public image?: boolean,
        public icon?: boolean
    ) {
        super(id, name, bgColor, image, icon);
    }

}