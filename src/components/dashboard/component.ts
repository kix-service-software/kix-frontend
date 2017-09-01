import { ContainerRow } from './../../model/client/components/dragable-container/ContainerRow';
import { ContainerConfig } from './../../model/client/components/dragable-container/ContainerConfig';
class DashboardComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            containerConfig: null
        };

        const containerConfig = new ContainerConfig();
        containerConfig.dragRows = true;

        const rows: ContainerRow[] = [];

        for (let i = 0; i < 3; i++) {
            const row = new ContainerRow();
            row.dragWidgets = true;
            if (i === 1) {
                row.widgets = [""];
            } else {
                row.widgets = ["", "", ""];
            }
            rows.push(row);
        }

        containerConfig.rows = rows;
        this.state.containerConfig = containerConfig;
    }

    public onMount(): void {
        console.log("Mount Dashboard");
    }
}

module.exports = DashboardComponent;
