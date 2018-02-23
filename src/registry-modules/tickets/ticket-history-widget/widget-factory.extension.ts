import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize, DataType } from '@kix/core/dist/model';
import { StandardTableColumn } from '@kix/core/dist/browser';
import { TicketHistorySettings } from '../../../components/ticket/widgets/ticket-history-widget/TicketHistorySettings';

export class TicketHistoryWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-history-widget";

    public type: WidgetType = WidgetType.LANE;

    public getDefaultConfiguration(): any {
        const settings: TicketHistorySettings = {
            tableColumns: [
                new StandardTableColumn('HistoryType', '', false, true, false, true, true, 100),
                new StandardTableColumn('Name', '', false, true, false, true, true, 200),
                new StandardTableColumn('ArticleID', '', false, true, false, true, true, 100),
                new StandardTableColumn('CreateBy', '', false, true, false, true, true, 100),
                new StandardTableColumn(
                    'CreateTime', '', false, true, false, true, true, 100, DataType.DATE_TIME
                )
            ]
        };
        return new WidgetConfiguration(
            this.widgetId, 'History', ['print-ticket-action'],
            settings, this.type, false, true, true, WidgetSize.BOTH, 'minus'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketHistoryWidgetFactoryExtension();
};
