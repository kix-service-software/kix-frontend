import { StandardTableComponentState } from './StandardTableComponentState';
import { StandardTableInput } from './StandardTableInput';
import { StandardTableConfiguration } from '@kix/core/dist/browser';

class StandardTableComponent {

    private state: StandardTableComponentState;

    public onCreate(input: any): void {
        this.state = new StandardTableComponentState();
        this.state.tableConfiguration = new StandardTableConfiguration(null, null, null, true, true);
    }

    public onInput(input: StandardTableInput): void {
        // this.state.tableConfiguration = input.tableConfiguration;
    }

    public onMount(): void {
        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));

        // Testdata
        this.state.columns = ['A', 'B', 'C', 'D', 'E', 'F'];
        this.state.rows = [{}, {}, {}, {}, {}];
    }

    private mousedown(col: string, event: any): void {
        this.state.resizeSettings.resizeColumn = col;
        this.state.resizeSettings.startOffset = event.target.offsetWidth - event.pageX;
    }

    private mousemove(event: any): void {
        if (this.state.resizeSettings.resizeColumn) {
            const selector = "[data-id='" + this.state.resizeSettings.resizeColumn + "']";
            const elements: any = document.querySelectorAll(selector);
            elements.forEach((element: any) => {
                element.style.width = this.state.resizeSettings.startOffset + 150 + event.pageX + 'px';
            });
        }
    }

    private mouseup(): void {
        this.state.resizeSettings.resizeColumn = undefined;
    }


}

module.exports = StandardTableComponent;
