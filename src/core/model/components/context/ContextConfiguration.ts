/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredWidget } from "..";

export class ContextConfiguration {

    public constructor(
        public contextId: string,
        public sidebars: string[] = [],
        public sidebarWidgets: ConfiguredWidget[] = [],
        public explorer: string[] = [],
        public explorerWidgets: ConfiguredWidget[] = [],
        public lanes: string[] = [],
        public laneWidgets: ConfiguredWidget[] = [],
        public content: string[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public generalActions: string[] = [],
        public actions: string[] = [],
        public overlayWidgets: ConfiguredWidget[] = []
    ) { }

}
