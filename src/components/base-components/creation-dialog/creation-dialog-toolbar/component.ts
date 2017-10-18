class CreateObjectToolbarComponent {

    public state: any;

    public onCreate(): void {
        this.state = {
            title: "Neues Objekt erstellen",
            showCreateObjectDialog: false
        };
    }

    public openCreateObjectDialog(): void {
        this.state.showCreateObjectDialog = true;
    }

    public closeCreateObjectDialog(): void {
        this.state.showCreateObjectDialog = false;
    }

}

module.exports = CreateObjectToolbarComponent;
