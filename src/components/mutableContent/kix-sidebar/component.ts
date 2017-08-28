class KIXSidebarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Sidebar");
    }
}

module.exports = KIXSidebarComponent;
