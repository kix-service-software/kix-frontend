class KIXSidebarRightComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Right Sidebar");
    }
}

module.exports = KIXSidebarRightComponent;
