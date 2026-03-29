export type DatePreset = 'today' | 'tomorrow' | 'week' | 'month';

export class DateHelper {
  private dayStart(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0,
    );
  }

  private dayEnd(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  public addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public getDateRange(presetOrDate: DatePreset | Date): [Date, Date] {
    if (presetOrDate instanceof Date) {
      return [this.dayStart(presetOrDate), this.dayEnd(presetOrDate)];
    }

    const now = new Date();
    const todayStart = this.dayStart(now);

    if (presetOrDate === 'today') {
      return [todayStart, this.dayEnd(now)];
    }

    if (presetOrDate === 'tomorrow') {
      const tomorrow = this.addDays(todayStart, 1);
      return [this.dayStart(tomorrow), this.dayEnd(tomorrow)];
    }

    if (presetOrDate === 'week') {
      const weekEnd = this.dayEnd(this.addDays(todayStart, 6));
      return [todayStart, weekEnd];
    }

    const monthEnd = new Date(
      todayStart.getFullYear(),
      todayStart.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return [todayStart, monthEnd];
  }
}
