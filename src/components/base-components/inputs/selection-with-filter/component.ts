class SelectionWithFilter {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            list: input.list
        };
    }

}

module.exports = SelectionWithFilter;
