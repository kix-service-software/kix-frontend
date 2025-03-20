/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { IdService } from '../../../../../model/IdService';
import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { TreeNode } from '../../../../base-components/webapp/core/tree/TreeNode';
import { Table } from '../../../../table/model/Table';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public title: string = 'admin-object-tag Component',
        public tables: Table[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public instanceId: string = IdService.generateDateBasedId(),
        public prepared: boolean = false,
        public canExport: boolean = false,
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public autoCompleteConfiguration: AutoCompleteConfiguration = new AutoCompleteConfiguration(),
        public loadNodes: () => Promise<TreeNode[]> =  null,
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}