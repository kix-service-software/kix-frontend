/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../../model/configuration/WidgetConfiguration';
import { ContextType } from '../../../../../../model/ContextType';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public contextId: string = null,
        public nodes: TreeNode[] = [],
        public activeNode: TreeNode = null
    ) { }

}
