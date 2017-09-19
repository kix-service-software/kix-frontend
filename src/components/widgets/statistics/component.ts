class StatisticsWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            type: input.type || 'pie',
            id: '#chart' + Math.floor((Math.random() * 10) + 1),
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

}

module.exports = StatisticsWidgetComponent;
