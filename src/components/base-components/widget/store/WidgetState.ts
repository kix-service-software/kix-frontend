import { WidgetConfiguration } from '@kix/core';
import { WidgetSocketListener } from './../socket/WidgetSocketListener';

export class WidgetState {

    public configuration: WidgetConfiguration;

    public socketlListener: WidgetSocketListener;

    public error: string;

}
