import {
    IdService, TableConfiguration, SearchOperator, TableHeaderHeight, TableRowHeight
} from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, TableWidgetSettings, QueueProperty,
    KIXObjectLoadingOptions, FilterCriteria, FilterType, FilterDataType
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-queues-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Ticket: Queues',
            [
                'ticket-admin-queue-create', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.QUEUE, [QueueProperty.NAME, SortOrder.UP],
                new TableConfiguration(
                    KIXObjectType.QUEUE,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                FilterDataType.NUMERIC, FilterType.AND, null
                            ),
                        ], null, null,
                        [QueueProperty.SUB_QUEUES], [QueueProperty.SUB_QUEUES]
                    ), null, null, true, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears')
    ) { }

}
