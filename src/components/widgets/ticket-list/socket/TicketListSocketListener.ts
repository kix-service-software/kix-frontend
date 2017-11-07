import { WidgetSocketListener } from '@kix/core/dist/model/client/socket/widget/WidgetSocketListener';

export class TicketListSocketListener extends WidgetSocketListener {

    protected handleWidgetSocketError(error: any): void {
        throw new Error("Method not implemented.");
    }

    protected widgetLoaded(configuration: any): void {
        throw new Error("Method not implemented.");
    }

}
