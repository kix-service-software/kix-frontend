/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { TreeNode } from '../../../../base-components/webapp/core/tree';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public loadNodes: () => Promise<TreeNode[]> = null,
        public parameter: string = '',
        public output: string = '',
        public canRun: boolean = false,
        public run: boolean = false
    ) {
        super();
    }

}
