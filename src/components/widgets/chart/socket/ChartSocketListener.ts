import {
    WidgetConfiguration,
    WIDGET_LOADED
} from '@kix/core/dist/model/client';
import { WidgetSocketListener } from '@kix/core/dist/model/client/socket/widget/WidgetSocketListener';

declare var io;

export class ChartSocketListener extends WidgetSocketListener {

    public constructor(store: any, widgetId: string, instanceId: string) {
        super(store, widgetId, instanceId);
    }

    protected handleWidgetSocketError(error: any): void {
        // TODO: Error Handling
        console.error(error);
        this.widgetSocket.close();
    }

    protected widgetLoaded(configuration: WidgetConfiguration): void {
        this.store.dispatch(WIDGET_LOADED(configuration));
    }

}
