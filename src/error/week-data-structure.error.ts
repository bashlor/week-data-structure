import { ErrorType } from '../type/error.type';

export class WeekDataStructureError extends Error {
  private readonly TIME_FORMAT = `[0 <= HH < 24, 0 <= MM < 60]\nHH:MM`;
  private readonly RANGE_FORMAT = `${this.TIME_FORMAT}-${this.TIME_FORMAT}`;
  private readonly RANGE_CHAIN_FORMAT = `${this.RANGE_FORMAT},${this.RANGE_FORMAT},${this.RANGE_FORMAT},...`;
  private readonly DAY_FORMAT = `ISO DATE;${this.RANGE_FORMAT}`;

  constructor(message: string);
  constructor(value: string, type: ErrorType, asMessage?: boolean);
  constructor(messageOrValue: string, type?: ErrorType, asMessage = false) {
    super(messageOrValue);

    if (asMessage) return;

    switch (type) {
      case 'Time':
        this.message = this.parseMessage(type, this.TIME_FORMAT, messageOrValue);
        break;
      case 'Timeslot':
        this.message = this.parseMessage(type, this.RANGE_FORMAT, messageOrValue);
        break;
      case 'TimeslotSeries':
        this.message = this.parseMessage(type, this.RANGE_CHAIN_FORMAT, messageOrValue);
        break;
      case 'Day':
        this.message = this.parseMessage(type, this.DAY_FORMAT, messageOrValue);
        break;
    }
  }

  private parseMessage(type: ErrorType, format: string, provided?: string): string {
    const prov = provided != null ? `\n[Provided]: ${provided}` : '';
    return `[${type}]: Provided string does not meet the required format.\n[Format]: ${format}${prov}`;
  }
}
