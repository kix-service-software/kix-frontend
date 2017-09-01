class KIXListSkimmerComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount List Skimmer");
    }
}

module.exports = KIXListSkimmerComponent;
