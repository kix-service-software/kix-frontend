class SelectionWithProperties {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            list: input.list,
            properties: input.properties
        };
    }

    public onInput(input: any): void {
        this.state = {
            list: input.list,
            properties: input.properties
        };
    }
}

module.exports = SelectionWithProperties;
