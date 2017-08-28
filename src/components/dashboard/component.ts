class DashboardComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Dashboard");
    }
}

module.exports = DashboardComponent;
