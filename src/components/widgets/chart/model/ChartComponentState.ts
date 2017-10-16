import { ChartConfiguration, WidgetComponentState } from '@kix/core/dist/model/client';

export class ChartComponentState extends WidgetComponentState {

    public svgId: string;

    public constructor() {
        super();
        this.svgId = 'chart-' + Date.now() + Math.round((Math.random() * 100 - 80));
    }

}
