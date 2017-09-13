class KIXSidebarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            sidebars: input.templateData.sidebars || [],
            configurationMode: false
        };
    }

    // function to show/hide given sidebar
    public toggleSidebar(sidebarIndex: number): void {
        console.log(sidebarIndex);
        if (sidebarIndex === null) {
            return;
        }
        this.state.sidebars[sidebarIndex].show = !this.state.sidebars[sidebarIndex].show;
        this.state.sidebars = [...this.state.sidebars];
    }

    public configurationClicked(): void {
        this.state.configurationMode = !this.state.configurationMode;
        (this as any).emit('toggleConfigurationMode');
    }
}

module.exports = KIXSidebarComponent;
