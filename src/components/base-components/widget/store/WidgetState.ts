import { WidgetConfiguration } from './../../../../model/client/components/widget/WidgetConfiguration';
import { WidgetSocketListener } from './../socket/WidgetSocketListener';

export class WidgetState {

    public configuration: WidgetConfiguration;

    public socketlListener: WidgetSocketListener;

    public error: string;

}
