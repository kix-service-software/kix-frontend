import { StandardTable, TableConfiguration } from '../../../../core/browser';
import { AbstractAction, ConfigItemHistory, ConfigItem } from '../../../../core/model';
import { WidgetComponentState } from '../../../../core/model/';

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public configItemId: number = null,
        public standardTable: StandardTable<ConfigItemHistory> = null,
        public filterValue: string = '',
        public actions: AbstractAction[] = [],
        public configItem: ConfigItem = null,
        public filterCount: number = null
    ) {
        super();
    }

}
