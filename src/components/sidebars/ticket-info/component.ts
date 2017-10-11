class TicketInfoSidebarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketAttr: [
                {
                    label: 'Kundennummer',
                    value: 'ABC'
                },
                {
                    label: 'Typ',
                    value: 'Bug'
                },
                {
                    label: 'Status',
                    value: 'in Bearbeitung'
                },
            ]
        };
    }
}

module.exports = TicketInfoSidebarComponent;
