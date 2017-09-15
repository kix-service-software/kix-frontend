class ActionOverlayComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            showOverlay: false,
            action: input.action,
            contentData: null
        };
    }

    public onInput(input: any): void {
        this.state.showOverlay = input.showOverlay;
        this.state.contentData = input.contentData;
    }

    public runClicked(): void {
        (this as any).emit('runAction');
    }

    public cancelClicked(): void {
        (this as any).emit('cancelAction');
    }

}

module.exports = ActionOverlayComponent;
