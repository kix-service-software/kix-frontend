import { EventService } from "../../../../core/browser/event";
import { ApplicationEvent } from "../../../../core/browser/application";

class Component {

    public refreshClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        EventService.getInstance().publish(ApplicationEvent.REFRESH);
    }

}

module.exports = Component;
