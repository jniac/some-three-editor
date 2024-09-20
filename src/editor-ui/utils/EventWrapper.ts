
export class EventWrapper {
  orignalEvent: any

  get metaKey() { return this.orignalEvent.metaKey ?? false }
  get shiftKey() { return this.orignalEvent.shiftKey ?? false }
  get ctrlKey() { return this.orignalEvent.ctrlKey ?? false }
  get altKey() { return this.orignalEvent.altKey ?? false }

  constructor(event: Event) {
    this.orignalEvent = event
  }
}
