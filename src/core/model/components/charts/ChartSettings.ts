export class ChartSettings {

    public constructor(
        public chartType: string,
        public templateId: string = '',
        public attributes: string[] = [],
        // TODO: public colors: Map<string, string>, --> attribute, color
        // TODO: public axes: Map<string, string>,   --> attribute, axis
        public showLegend: boolean = true,
        public showAxes: boolean = true,
        public showValues: boolean = true
    ) { }
}
