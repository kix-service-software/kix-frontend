import { ChartSocketListener } from './../socket/ChartSocketListener';
import { ChartSettings, WidgetReduxState } from '@kix/core/dist/model/client';

export class ChartReduxState extends WidgetReduxState {

    public configuration: ChartSettings;

    public socketListener: ChartSocketListener;

}
