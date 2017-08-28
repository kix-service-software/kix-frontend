class KIXBackComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Back");
    }
}

module.exports = KIXBackComponent;
