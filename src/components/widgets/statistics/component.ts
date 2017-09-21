class StatisticsWidgetComponent {
    public state: any;
    public onCreate(input: any): void {
        let chartType = 'stacked-bar';
        if (input.configuration && input.configuration.chartType) {
            chartType = input.configuration.chartType;
        }
        console.log(Date.now());
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
            }
        }
            ;
    }
    public contentDataLoaded(contentData: any): void {
        // this.state.contentData = contentData;
    }
    public onUpdateContentConfigurationHandler(handler: any): void {
        // this.updateContentConfigurationHandler = handler;
    }
}

module.exports = StatisticsWidgetComponent;
