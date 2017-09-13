class NotesSidebarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            notes: 'Das ist eine Notiz :D'
        };
    }
}

module.exports = NotesSidebarComponent;
