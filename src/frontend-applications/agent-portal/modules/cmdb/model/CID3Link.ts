/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { GraphD3Link } from '../../graph/model/GraphD3Link';
import { GraphD3Node } from '../../graph/model/GraphD3Node';

export class CID3Link extends GraphD3Link {

    public color: string;

    public constructor(
        link: GraphD3Link,
        sourceNode: GraphD3Node,
        targetNode: GraphD3Node) {
        super(link.source, link.target, link.linkType);

        this.bidirectional = link.bidirectional;
        this.color = sourceNode?.bgColor;

    }
}