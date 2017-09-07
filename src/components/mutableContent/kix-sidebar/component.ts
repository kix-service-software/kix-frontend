class KIXSidebarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            // TODO: just as placeholder
            showNodeSidebar: true,
            hasRightsForNodeSidebar: true
        };
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

    public configurationClicked(): void {
        (this as any).emit('toggleConfigurationMode');
    }
}

module.exports = KIXSidebarComponent;
