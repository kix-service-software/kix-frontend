import { WidgetConfiguration } from '..';
import { ISocketRequest } from '../../../socket';

export class SaveWidgetRequest<T = any> implements ISocketRequest {
    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public contextId: string,
        public instanceId: string,
        public widgetConfiguration: WidgetConfiguration<T>
    ) { }
}
