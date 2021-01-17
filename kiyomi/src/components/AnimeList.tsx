import { IonCol, IonGrid, IonList, IonRow } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnimeEntry } from '../models/AnimeEntry';
import { AnimeStore } from '../models/AnimeStore';
import { UserStore } from '../models/UserStore';
import AnimeCard from './AnimeCard';

const AnimeList: React.FC = () => {

   const [season, setSeason] = useState<AnimeEntry[]>([]);

   useEffect(() => {
      const s = combineLatest([AnimeStore.season$, UserStore.user$.pipe(map(u => u ? u.watching : []))])
         .pipe(map(([season, watching]) => {
            season.forEach(entry => {
               if (watching.includes(entry.id)) {
                  entry.watching = true;
               } else {
                  entry.watching = false;
               }
            });
            return [...season];
         })).subscribe(setSeason)
      return () => s.unsubscribe();
   }, []);

   return (
      <IonList>
         <IonGrid>
            <IonRow>
               {season.map(entry =>
                  <IonCol size="4" style={{ height: '320px', marginBottom: '10px' }} key={entry.id}>
                     <AnimeCard id={entry.id} title={entry.title} image={entry.main_picture.medium} watching={entry.watching}></AnimeCard>
                  </IonCol>
               )}
            </IonRow>
         </IonGrid>
      </IonList>
   )
}

export default AnimeList;

