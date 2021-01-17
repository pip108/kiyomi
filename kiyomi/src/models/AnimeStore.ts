import { BehaviorSubject, combineLatest } from 'rxjs';
import { AnimeEntry } from './AnimeEntry';
import {  map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from './HttpClient';
import { UserStore } from './UserStore';
import { DateUtil } from '../util/DateUtil';

export class AnimeProvider {

   private seasonSubject = new BehaviorSubject([] as AnimeEntry[]);
   private filterSubject = new BehaviorSubject('');
   private loadingSubject = new BehaviorSubject(true);

   public loading$ = this.loadingSubject.asObservable();

   public season$ = combineLatest([this.seasonSubject, this.filterSubject])
      .pipe(map(([s, f]) => {
         if (!f) {
            return s;
         }
         const filtered: AnimeEntry[] = [];
         s.forEach(x => {
            if (x.title.toLowerCase().includes(f.toLocaleLowerCase())) {
               filtered.push(x);
            }
         });
         return filtered;
      }))

   public setFilter(filter: string) {
      this.filterSubject.next(filter);
   }

   public watched$ = UserStore.user$.pipe(
      map(u => u ? u.watching : []),
      switchMap(async watchedIds => {
         this.loadingSubject.next(true);
         const fetches: Promise<AnimeEntry>[] = [];
         watchedIds.forEach(wid => fetches.push(HttpClient.get(`anime/${wid}?fields=broadcast,average_episode_duration`)));
         const watched = await Promise.all(fetches);
         watched.forEach(x => {
            const [hour, min] = DateUtil.getLocalAirTime(x.broadcast.start_time);
            x.adjusted_airtime = { hour: hour, min: min };
            x.adjusted_weekday = DateUtil.getLocalAirday(x.broadcast.day_of_the_week, x.broadcast.start_time);
         })
         this.loadingSubject.next(false);
         return watched;
      })
   );

   private load = async () => {
      const response = await window.fetch('v2/anime/season/2021/winter?limit=100');
      const json = await response.json();
      const data = json.data.map((x: { node: AnimeEntry }) => x.node);
      this.seasonSubject.next(data);
      this.loadingSubject.next(false);
   };

   constructor() {
      (async () => {
         await this.load();
      })();
   }
}

export const AnimeStore = new AnimeProvider();