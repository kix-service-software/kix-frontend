class DashboardComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            widgets: [
                new Widget("Widget01", "FAQ"),
                new Widget("Widget02", "Statistik"),
                new Widget("Widget03", "Ticketliste"),
                new Widget("Widget04", "TODOs"),
                new Widget("Widget05", "Active User"),
                new Widget("Widget06", "Eskalationen"),
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
        event.dataTransfer.setData("widgetId", event.target.id);
        this.state.dragging = true;

        const widget = this.state.widgets.find((w) => w.id === event.target.id);
        widget.drag = true;
    }

    public dragOver(event): void {
        if (event.preventDefault) {
            // Necessary. Allows us to drop.
            event.preventDefault();
        }

        const dropWidgetId = event.target.id;
        const dragWidgetId = event.dataTransfer.getData("widgetId");

        if ((dropWidgetId === dragWidgetId) || (dropWidgetId === "" || dragWidgetId === "")) {
            return;
        }

        const array = this.state.widgets;

        const dragIndex = array.findIndex((element, index, widgets) => {
            return element.id === dragWidgetId;
        });
        const dragWidget = array.find((w) => w.id === dragWidgetId);

        array.splice(dragIndex, 1);

        const dropIndex = array.findIndex((element, index, widgets) => {
            return element.id === dropWidgetId;
        });
        const dropWidget = array.find((w) => w.id === dropWidgetId);
        array.splice(dropIndex, 1);

        if (dragIndex > dropIndex) {
            array.splice(dropIndex, 0, dragWidget);
            array.splice(dragIndex, 0, dropWidget);
        } else {
            array.splice(dragIndex, 0, dropWidget);
            array.splice(dropIndex + 1, 0, dragWidget);
        }

        this.state.widgets = Array.from(array);

        event.dataTransfer.dropEffect = 'move';
    }

    public drop(event): void {
        event.preventDefault();
        this.state.tempWidgets = [];
        this.state.dragging = false;
        this.resetDragOver();
    }

    private setDragOver(widgetId: string, over: boolean = true) {
        const widget = this.state.widgets.find((w) => w.id === widgetId);
        if (widget) {
            widget.dragOver = over;
        }
    }

    private resetDragOver(): void {
        for (const widget of this.state.widgets) {
            widget.dragOver = false;
            widget.drag = false;
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
class Widget {

    public id: string;

    public name: string;

    public dragOver: boolean = false;

    public drag: boolean = false;

    public constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

}

module.exports = DashboardComponent;
