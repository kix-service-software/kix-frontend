class DeleteActionComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            action: input.action,
            running: false
        };
    }


}

module.exports = DeleteActionComponent;
