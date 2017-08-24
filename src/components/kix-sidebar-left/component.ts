class KIXSidebarLeftComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Left Sidebar");
    }
}

module.exports = KIXSidebarLeftComponent;
