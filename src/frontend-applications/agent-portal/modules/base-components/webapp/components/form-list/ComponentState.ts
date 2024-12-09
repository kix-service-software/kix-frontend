/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { TreeNode } from '../../core/tree';
import { FormInputAction } from '../../../../../modules/base-components/webapp/core/FormInputAction';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public expanded: boolean = false,
        public listId: string = IdService.generateDateBasedId('form-list-'),
        public treeId: string = listId + '-tree',
        public readonly: boolean = true,
        public invalid: boolean = false,
        public isLoading: boolean = false,
        public placeholder: string = null,
        public disabled: boolean = false,
        public treeStyle: any = null,
        public prepared: boolean = false,
        public loadNodes: () => Promise<TreeNode[]> = null,
        public removeNodes: boolean = false,
        public removeOnClose: boolean = false,
        public multiselect: boolean = false,
        public actions: FormInputAction[] = [],
    ) {
        super();
    }

}
