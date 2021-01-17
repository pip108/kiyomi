import { Constants } from "../models/Constants";

export class DateUtility {

   private parseTime(time_str: string): number[] {
      const [hour_str, min_str] = time_str.split(':');
      return [Number(hour_str), Number(min_str)];
   }

   public getLocalAirTime(start_time: string): number[] {

      const [hour, min] = this.parseTime(start_time);

      const jst = new Date(new Date().toLocaleString('JP', { timeZone: 'Asia/Tokyo' }));

      const local = new Date();
      const localTime = local.getTime();
      const jstTime = jst.getTime();
      const msDiff = Math.abs(localTime - jstTime);

      const fixOffset = new Date();
      fixOffset.setHours(hour);
      fixOffset.setMinutes(min);
      const adjustment = (localTime < jstTime ? -1 : 1) * msDiff;


      const d = new Date(fixOffset.getTime() + adjustment);
      return [ d.getHours(), d.getMinutes() ];
   }

   public getLocalAirday(weekday: string, start_time: string): number {
      let weekday_num = Constants.Weekdays.indexOf(weekday);
      const jst = new Date(new Date().toLocaleString('JP', { timeZone: 'Asia/Tokyo' }));

      const jstTime = jst.getTime();
      const localTime = Date.now();
      const msDiff = Math.abs(localTime - jstTime);
      const adjustment = (localTime < jstTime ? -1 : 1) * msDiff;

      const offset = Math.round(adjustment / 1000 / 60 / 60);
      const local = new Date();
      const [hour, min] = this.parseTime(start_time);
      local.setHours(hour);
      local.setMinutes(min);
      if (local.getHours() + offset < 0) {
         weekday_num -= 1;
         weekday_num = weekday_num < 0 ? 6 : weekday_num;
      } else if (local.getHours() + offset > 23) {
         weekday_num += 1;
         weekday_num = weekday_num > 6 ? 0 : weekday_num;
      }
      return weekday_num;
   }

   public getCapitalizedDay(day: number): string {
      return Constants.Weekdays[day].charAt(0).toUpperCase() + 
      Constants.Weekdays[day].slice(1);
   }

   public getDateLabel(date: Date): string {
      return this.getCapitalizedDay(date.getDay())
         + ' ' + date.getDate()
         + '.' + (date.getMonth() + 1)
         + '.' + date.getFullYear();
   }

   public getRestOfWeek(date: Date): Date[] {
      const rest: Date[] = [];
      for (let i = 0; i < 3; i++) {
         const d = new Date();
         d.setDate(d.getDate() + i + 1);
         rest.push(d)
      }
      return rest;
   }


   public padNumber(number: number): string {
      return number < 10 ? `0${number}` : number.toString();
   }
}

export const DateUtil = new DateUtility();