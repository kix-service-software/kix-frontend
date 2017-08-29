class DashboardComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            text: 'Test'
        };
    }

    public onMount(): void {
        console.log("Mount Dashboard");
    }

    public sayHello(): void {
        alert('Hello');
    }
}

module.exports = DashboardComponent;
