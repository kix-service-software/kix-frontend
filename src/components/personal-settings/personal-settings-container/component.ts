class PersonalSettingsContainerComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            settings: [
                "General",
                "Main Menu",
                "Sprache"
            ]
        };
    }

}

module.exports = PersonalSettingsContainerComponent;
