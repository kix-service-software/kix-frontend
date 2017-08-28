class KIXBreadcrumbComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        console.log("Mount Breadcrumb");
    }
}

module.exports = KIXBreadcrumbComponent;
