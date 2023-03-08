/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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