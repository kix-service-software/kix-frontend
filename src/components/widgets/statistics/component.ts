class StatisticsWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        let chartType = 'bar';
        if (input.configuration && input.configuration.chartType) {
            chartType = input.configuration.chartType;
        }
        this.state = {
            chartType,
            chartId: 'chart' + Math.floor((Math.random() * 100000) + 1),
            chartData: {
                width: 300,
                heigth: 300,
                data: [
                    { label: 'A', value: '15' },
                    { label: 'B', value: '75' },
                    { label: 'C', value: '5' },
                    { label: 'D', value: '35' }
                ]
            }
        };
    }

    public contentDataLoaded(contentData: any): void {
        // this.state.contentData = contentData;
    }

    public onUpdateContentConfigurationHandler(handler: any): void {
        // this.updateContentConfigurationHandler = handler;
    }

}

module.exports = StatisticsWidgetComponent;
