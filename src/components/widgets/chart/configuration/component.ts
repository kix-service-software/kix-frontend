class ChartConfigurationComponent {

    public state: any;

    public onCreate(input: any): void {
        // TODO: get types with function (including from extensions)
        const types = {
            1: 'pie',
            2: 'bar',
            3: 'stacked-bar',
            4: 'stacked-bar-horizontal'
        };
        this.state = {
            configuration: null,
            types
        };
    }

    public onInput(input: any): void {
        this.state.configuration = input.configuration;
    }

    public typeChanged(event): void {
        this.state.configuration.typeId = event.target.value;
    }

}

module.exports = ChartConfigurationComponent;
