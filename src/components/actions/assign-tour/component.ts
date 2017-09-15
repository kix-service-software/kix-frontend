class DeleteActionComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            action: input.action,
            running: false,
            contentData: []
        };
    }

    public onInput(input: any): void {
        this.state.contentData = input.contentData;
    }


}

module.exports = DeleteActionComponent;
