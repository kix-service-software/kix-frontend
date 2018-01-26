class DynamicFieldsContainerComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            dynamicFields: [],
            ticketId: null
        };
    }

    public onInput(input: any): void {
        this.state.dynamicFields = input.dynamicFields;
        this.state.ticketId = Number(input.ticketId);
    }

}

module.exports = DynamicFieldsContainerComponent;
