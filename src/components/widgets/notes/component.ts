class NotesWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            notes: 'Das ist eine Notiz :D',
            showConfiguration: false
        };
    }

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }

    // TODO: remove - just for testing
    public changeNotes(): void {
        this.state.notes = '<p>It\'s a me <span style="red">Mario</span> :D</p>';
    }
}

module.exports = NotesWidgetComponent;
