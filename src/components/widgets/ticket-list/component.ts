class TicketListWidgetComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            columns: [
                "alle",
                "Prio",
                "Titel",
                "T#",
                "Queue",
                "Bearbeiter",
                "Fälligkeitsdatum",
                "Alter"
            ],
            values: [
                ["1", "Werbemittel für neue Messe", "T#20170815104515", "Vertrieb", "Kunde", "29.10.2017", "159d 13h"],
                ["2", "Werbemittel für neue Messe", "T#20170815104515", "Vertrieb", "Kunde", "29.10.2017", "159d 13h"],
                ["3", "Werbemittel für neue Messe", "T#20170815104515", "Vertrieb", "Kunde", "29.10.2017", "159d 13h"],
                ["4", "Werbemittel für neue Messe", "T#20170815104515", "Vertrieb", "Kunde", "29.10.2017", "159d 13h"],
                ["5", "Werbemittel für neue Messe", "T#20170815104515", "Vertrieb", "Kunde", "29.10.2017", "159d 13h"],
            ]
        };
    }
}

module.exports = TicketListWidgetComponent;
