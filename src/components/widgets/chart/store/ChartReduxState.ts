import { ChartSocketListener } from './../socket/ChartSocketListener';
import { ChartConfiguration, WidgetReduxState } from '@kix/core/dist/model/client';

export class ChartReduxState extends WidgetReduxState {

    public configuration: ChartConfiguration;

    public socketListener: ChartSocketListener;

}
