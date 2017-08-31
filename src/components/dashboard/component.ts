class DashboardComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            widgets: [
                "Widget01",
                "Widget02",
                "Widget03",
                "Widget04",
                "Widget05",
                "Widget06"
            ],
            tempWidgets: [],
            dragging: false
        };
    }

    public onMount(): void {
        console.log("Mount Dashboard");
    }

    public sayHello(): void {
        alert('Hello');
    }

    public dragStart(event): void {
        this.state.tempWidgets = Array.from(this.state.widgets);
        event.dataTransfer.setData("text", event.target.id);
        // TODO: Add CSS via state conditions
        // TODO: data possible as object
        event.dataTransfer.setData("widgetId", event.target.id);
        event.target.classList.add('drag');
    }

    public dragOver(event): void {
        if (event.preventDefault) {
            // Necessary. Allows us to drop.
            event.preventDefault();
        }

        const dropWidgetId = event.target.id;
        const dragWidgetId = event.dataTransfer.getData("widgetId");

        if ((dropWidgetId === dragWidgetId) ||
            (dropWidgetId === "" || dragWidgetId === "")) {
            return;
        }

        const array = this.state.widgets;

        const dragIndex = array.indexOf(dragWidgetId);
        array.splice(dragIndex, 1);

        const dropIndex = array.indexOf(dropWidgetId);
        array.splice(dropIndex, 1);

        if (dragIndex > dropIndex) {
            array.splice(dropIndex, 0, dragWidgetId);
            array.splice(dragIndex, 0, dropWidgetId);
        } else {
            array.splice(dragIndex, 0, dropWidgetId);
            array.splice(dropIndex + 1, 0, dragWidgetId);
        }

        this.state.widgets = Array.from(array);

        event.dataTransfer.dropEffect = 'move';
    }

    public dragEnter(event): void {
        // TODO: Add CSS via state conditions
        event.target.classList.add('over');
    }

    public dragLeave(event): void {
        // TODO: Add CSS via state conditions
        event.target.classList.remove('over');
    }

    public drop(event): void {
        event.preventDefault();
        this.state.tempWidgets = [];
        this.resetCSS();
    }

    // TODO: Add CSS via state conditions
    private resetCSS(): void {
        for (const widgetId of this.state.widgets) {
            const element = document.getElementById(widgetId);
            element.classList.remove('over');
            element.classList.remove('drag');
        }
    }
}

module.exports = DashboardComponent;
