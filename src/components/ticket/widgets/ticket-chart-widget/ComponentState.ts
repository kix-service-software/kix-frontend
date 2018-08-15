import { StandardTable } from '@kix/core/dist/browser';
import { WidgetComponentState, IAction, KIXObjectPropertyFilter } from '@kix/core/dist/model';
import { ChartConfiguration } from 'chart.js';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public title: string = '',
        public chartConfig: ChartConfiguration = null
    ) {
        super();
    }

}
