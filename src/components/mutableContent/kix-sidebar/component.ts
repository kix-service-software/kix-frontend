class KIXSidebarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            showNodeSidebar: true,
            hasRightsForNodeSidebar: true
        };
    }

    public onMount(): void {
        console.log("Mount Sidebar");
    }

    // function to show/hide given sidebar
    public toggleSidebar(sidebar: string): void {
        if (!sidebar) {
            return;
        }
        if (this.state['show' + sidebar]) {
            this.state['show' + sidebar] = false;
        } else {
            this.state['show' + sidebar] = true;
        }
    }
}

module.exports = KIXSidebarComponent;
