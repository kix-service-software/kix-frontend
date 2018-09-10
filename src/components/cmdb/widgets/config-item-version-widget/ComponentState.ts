import { StandardTable, TableConfiguration } from '@kix/core/dist/browser';
import { AbstractAction, ConfigItemHistory, ConfigItem } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/model/';

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public actions: AbstractAction[] = [],
        public title: string = 'Versiondetails',
        public table: StandardTable = null
    ) {
        super();
    }

}
