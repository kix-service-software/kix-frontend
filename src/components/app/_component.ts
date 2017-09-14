class AppComponent {

    public state: any;

    public onCreate(input: any): void {
        // TODO: Gewünschtes Theme aus Config auslesen -> Config im Adminbereich existiert noch nicht
        this.state = {
            // theme: 'high-contrast'
            // theme: 'accessible'
        };
    }
}

module.exports = AppComponent;
