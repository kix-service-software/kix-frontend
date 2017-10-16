class SearchTemplatesWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            showConfiguration: false
        };
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

    public showConfigurationClicked(): void {
        this.state.showConfiguration = true;
    }

    public saveConfiguration(): void {
        this.cancelConfiguration();
    }

    public cancelConfiguration(): void {
        this.state.showConfiguration = false;
    }
}

module.exports = SearchTemplatesWidgetComponent;
