import { ChartSocketListener } from './../socket/ChartSocketListener';
import { } from '@kix/core/dist/model/client/';
import { ChartConfiguration, WidgetReduxState } from '@kix/core/dist/model/client';

export class ChartReduxState extends WidgetReduxState {

    public users: any[] = [];

    public configuration: ChartConfiguration;

    public socketListener: ChartSocketListener;

}
