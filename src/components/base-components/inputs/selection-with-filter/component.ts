class SelectionWithFilter {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            list: input.list
        };
    }

    public onInput(input: any): void {
        this.state = {
            list: input.list
        };
    }

    public listSelected(event: any): void {
        const selectedElements = event.target.selectedOptions;
        const selectedIds = [];
        selectedElements.forEach((element) => {
            selectedIds.push(element.value);
        });
        (this as any).emit('selected', selectedIds);
    }
}

module.exports = SelectionWithFilter;
