module.exports = class Event {
    constructor(name, date, timeStart, duration, eventType, eventLocation) {
        this.name = name;
        let correctDate = date.split('/');
        correctDate[1] -= 1;
        console.log(correctDate.reverse().concat(timeStart.split(':')));
        this.start = new Date(...correctDate.concat(timeStart.split(':')));
        this.end = new Date(this.start.valueOf());
        this.end.setHours(this.end.getHours() + parseInt(duration.split('H')[0]));
        this.eventType = eventType;
        this.eventLocation = eventLocation;
    }

    csvLine() {
        return `${this.name},${this.start.toLocaleString('en-US', {year: 'numeric', month: 'numeric', day: 'numeric'})},${this.start.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit'})},${this.end.toLocaleString('en-US', {year: 'numeric', month: 'numeric', day: 'numeric'})},${this.end.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit'})},false,${this.eventType},${this.eventLocation},true`
    }
}