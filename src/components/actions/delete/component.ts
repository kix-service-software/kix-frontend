class DeleteActionComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            action: input.action
        };
    }

    public doAction(): void {
        alert('Delete Action');
    }

}

module.exports = DeleteActionComponent;
