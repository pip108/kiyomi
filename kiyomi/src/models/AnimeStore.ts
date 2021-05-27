import { BehaviorSubject, combineLatest } from 'rxjs';
import { AnimeEntry } from './AnimeEntry';
import {  map, switchMap } from 'rxjs/operators';
import { HttpClient } from './HttpClient';
import { UserStore } from './UserStore';
import { DateUtil } from '../util/DateUtil';

export class AnimeProvider {

   private seasonSubject = new BehaviorSubject([] as AnimeEntry[]);
   private filterSubject = new BehaviorSubject('');
   private seasonLoadingSubject = new BehaviorSubject(true);
   private watchedLoadingSubject = new BehaviorSubject(true);

   public watchedLoading$ = this.watchedLoadingSubject.asObservable();
   public seasonLoading$ = this.seasonLoadingSubject.asObservable();

   public season$ = combineLatest([this.seasonSubject, this.filterSubject])
      .pipe(map(([s, f]) => {
         if (!f) {
            return s;
         }
         const filtered: AnimeEntry[] = [];
         for (const x of s) {
             if (x.title.toLowerCase().includes(f.toLowerCase())) {
                 filtered.push(x);
             }
         }
         return filtered;
      }))

   public setFilter(filter: string) {
      this.filterSubject.next(filter);
   }

   public watched$ = UserStore.user$.pipe(
      map(u => u ? u.watching : []),
      switchMap(async (watchedIds) => {
         this.watchedLoadingSubject.next(true);
         const fetches: Promise<AnimeEntry>[] = [];
         for (const wid of watchedIds) {
            fetches.push(HttpClient.get(`anime/${wid}?fields=broadcast,average_episode_duration,end_date,start_date`));
         }
         const watched = await Promise.all(fetches);

         for (const w of watched) {
            if (!w.broadcast) {
               continue;
            }
            const [hour, min] = DateUtil.getLocalAirTime(w.broadcast.start_time);
            w.adjusted_airtime = { hour: hour, min: min };
            w.adjusted_weekday = DateUtil.getLocalAirday(w.broadcast.day_of_the_week, w.broadcast.start_time);
         }

         this.watchedLoadingSubject.next(false);
         return watched;
      })
   );

   private load = async () => {
      const [year, season] = DateUtil.getCurrentSeason();
      const response = await window.fetch(`anime/season/${year}/${season}?limit=300`);
      const json = await response.json();
      const data = json.data.map((x: { node: AnimeEntry }) => x.node);
      this.seasonSubject.next(data);
      this.seasonLoadingSubject.next(false);
   };

   constructor() {
      this.load();
   }
}

export const AnimeStore = new AnimeProvider();