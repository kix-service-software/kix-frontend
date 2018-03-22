import { QuickSearchComponentState } from './QuickSearchComponentState';

export class QuickSearchComponent {

    private state: QuickSearchComponentState;

    public onCreate(input: any): void {
        this.state = new QuickSearchComponentState();
    }
}

module.exports = QuickSearchComponent;
