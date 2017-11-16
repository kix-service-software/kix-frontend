class SelectionWithAction {

    private state: any;

    private translationIds: any;

    public onCreate(input: any): void {
        this.state = {
            list: input.list,
            actions: input.actions
        };
    }
}

module.exports = SelectionWithAction;
