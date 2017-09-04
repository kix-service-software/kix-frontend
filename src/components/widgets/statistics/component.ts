class StatisticsWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Statistics Widget");
    }
}

module.exports = StatisticsWidgetComponent;
