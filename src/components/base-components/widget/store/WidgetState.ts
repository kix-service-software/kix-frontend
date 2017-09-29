import { WidgetConfiguration } from '@kix/core/dist/model/client';
import { WidgetSocketListener } from './../socket/WidgetSocketListener';

export class WidgetState {

    public template: string;

    public configurationTemplate: string;

    public configuration: WidgetConfiguration;

    public socketlListener: WidgetSocketListener;

    public error: string;

}
