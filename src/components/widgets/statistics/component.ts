class StatisticsWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        let chartType = 'stacked-bar-horizontal';
        if (input.configuration && input.configuration.chartType) {
            chartType = input.configuration.chartType;
        }
        this.state = {
            chartType,
            chartData: {
                id: 'chart-' + Date.now(),
                data: [
                    { label: 'A', value: '15', color: 'red' },
                    { label: 'B', value: '75', color: 'green' },
                    { label: 'C', value: '5', color: 'yellow' },
                    { label: 'D', value: '35', color: 'blue' }
                ]
            },
            template: ''
        };
    }

    public onMount(): void {
        // this.state.template = require(this.state.chart.template);
        this.state.template = require('./../../base-components/charts/' + this.state.chartType);
    }

    public contentDataLoaded(contentData: any): void {
        // this.state.contentData = contentData;
    }

    public onUpdateContentConfigurationHandler(handler: any): void {
        // this.updateContentConfigurationHandler = handler;
    }
}

module.exports = StatisticsWidgetComponent;
