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