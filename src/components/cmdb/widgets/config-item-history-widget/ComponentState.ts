import { StandardTable, TableConfiguration } from '@kix/core/dist/browser';
import { AbstractAction, ConfigItemHistory, ConfigItem } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/model/';

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
