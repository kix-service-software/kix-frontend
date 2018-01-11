class TreeComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            tree: []
        };
    }

    public onInput(input: any): void {
        this.state.tree = input.tree || [];
    }

    private nodeClicked(id: any): void {
        (this as any).emit('nodeClicked', id);
    }

}

module.exports = TreeComponent;
