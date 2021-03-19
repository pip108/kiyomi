import { BehaviorSubject } from "rxjs";
import { HttpClient } from "./HttpClient";

export interface User {
   id: number;
   name: string;
   watching: number[];
}


export class UserProvider {
   public static readonly initial = { id: 0, name: '', watching: [] as number[] };
   private static readonly USERID_STORAGE_KEY = 'USER_ID';

   private initPromise: Promise<void>
   private userSubject = new BehaviorSubject<User | null>(null);
   public user$ = this.userSubject.asObservable();


   constructor() {
      this.initPromise = new Promise(async resolve => {
         const savedId = Number(localStorage.getItem(UserProvider.USERID_STORAGE_KEY));
         if (savedId !== 0) {
            await this.getUser(savedId);
         }
         resolve();
      });
   }

   public getInitPromise(): Promise<void> {
      return this.initPromise;
   }

   public async setUser(user: User) {
      const method = user.id === 0 ? HttpClient.post : HttpClient.put;
      const url = user.id === 0 ? '/kiyomi/user' : `/kiyomi/user/${user.id}`;
      try {
         user = await method(url, user);
         localStorage.setItem(UserProvider.USERID_STORAGE_KEY, user.id.toString());
         this.userSubject.next({ ...user });
      } catch(e) {
         console.log(e);
      }
   }

   public async getUser(id: number) {
      try {
         const user = await HttpClient.get(`/kiyomi/user/${id}`) as User;
         if (user) {
            this.userSubject.next(user);
         }
      } catch (e) {
         console.error(e);
      }
   }

   public async getUserByName(name: string): Promise<boolean> {
      try {
         const user = await HttpClient.get(`kiyomi/user?name=${name}`);
         if (user) {
            this.userSubject.next(user);
            return true;
         }
         return false;
      }
      catch (e) {
         console.log(e);
      }
      return false;
   }

   public async addWatched(animeId: number): Promise<void> {
      const user = this.userSubject.value;
      if (!user) {
         return;
      }
      if (user.watching.includes(animeId)) {
         return;
      }
      try {
         await HttpClient.post(`/kiyomi/user/${user.id}/watched`, { animeId: animeId });
         user.watching = [...user.watching, animeId];
         this.userSubject.next({ ...user });
      } catch(e) {
         console.log(e);
      }
   }

   public async removeWatched(animeId: number) {
      const user = this.userSubject.value;
      if (!user) {
         return;
      }
      const i = user.watching.indexOf(animeId);
      if (i > -1) {
         try {
            await HttpClient.delete(`/kiyomi/user/${user.id}/watched/${animeId}`);
            user.watching.splice(i, 1);
            this.userSubject.next({ ...user });
         } catch(e) {
            console.log(e);
         }
      }
   }
}

export const UserStore = new UserProvider();