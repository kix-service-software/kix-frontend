import { StandardTable, TableConfiguration } from '../../../../core/browser';
import { AbstractAction, ConfigItemHistory, ConfigItem } from '../../../../core/model';
import { WidgetComponentState } from '../../../../core/model/';

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public generalVersionActions: AbstractAction[] = [],
        public title: string = 'Versiondetails',
        public table: StandardTable = null
    ) {
        super();
    }

}
