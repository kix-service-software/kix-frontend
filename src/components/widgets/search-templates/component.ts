class SearchTemplatesWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public newClicked(event): void {
        alert('Neue Suchvorlage!');
    }

    public editClicked(event): void {
        alert('Suchvorlage bearbeiten!');
    }

    public deleteClicked(event): void {
        alert('Suchvorlage löschen!');
    }
}

module.exports = SearchTemplatesWidgetComponent;
