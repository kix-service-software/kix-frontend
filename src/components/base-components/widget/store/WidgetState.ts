import { WidgetConfiguration } from '@kix/core/dist/model/client';
import { WidgetSocketListener } from './../socket/WidgetSocketListener';

export class WidgetState {

    public configuration: WidgetConfiguration;

    public socketlListener: WidgetSocketListener;

    public error: string;

}
