import { WidgetComponentState, IAction, KIXObjectPropertyFilter } from '../../../../core/model';
import { ChartConfiguration } from 'chart.js';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public title: string = '',
        public chartConfig: ChartConfiguration = null
    ) {
        super();
    }

}
