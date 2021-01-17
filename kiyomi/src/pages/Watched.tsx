import { IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonSpinner } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { map } from 'rxjs/operators';
import Loading from '../components/Loading';
import Toolbar from '../components/Toolbar';
import WatchedItem from '../components/WatchedItem';
import { AnimeEntry } from '../models/AnimeEntry';
import { AnimeStore } from '../models/AnimeStore';
import { DateUtil } from '../util/DateUtil';


const Watched: React.FC = () => {

   const weekday = (new Date).getDay();


   const [days, setDays] = useState([] as {
      anime: AnimeEntry[],
      date: Date
   }[]);
   const [showDays, setShowDays] = useState(3);

   const [loading, setLoading] = useState(true);
   useEffect(() => {
      const s = AnimeStore.loading$.subscribe(setLoading);
      return () => s.unsubscribe();
   }, []);

   useEffect(() => {
      const s = AnimeStore.watched$
         .pipe(map(watched => {
            const set_days: { anime: AnimeEntry[], date: Date }[] = [];
            for (let i = 0; i < showDays; i++) {
               const set_date = new Date();
               set_date.setDate(set_date.getDate() + i);
               set_days[i] = {
                  anime: watched.filter(x => x.adjusted_weekday === (weekday + i)),
                  date: set_date
               };
            }
            return set_days;
         }))
         .subscribe(setDays);
      return () => s.unsubscribe();
   }, []);

   return (
      <IonPage>
         <IonHeader>
            <Toolbar />
         </IonHeader>
         <IonContent>
            { loading && 
               <Loading />
            }
            { !loading &&
               <IonGrid>
                  <IonRow>
                     <IonCol offset="3" size="6">
                        {
                           days.map((d, i) => <div key={d.date.getDate()}>
                              <h1>{i === 0 ? 'Today (' : ''}{DateUtil.getDateLabel(d.date)}{i === 0 ? ')' : ''}</h1>
                              {
                                 d.anime.length > 0 ? d.anime.map(a => <WatchedItem anime={a} key={a.id}></WatchedItem>)
                                    : <p style={{ marginLeft: '20px' }}><strong>No anime :(</strong></p>
                              }
                           </div>
                           )
                        }
                     </IonCol>
                  </IonRow>
               </IonGrid>
            }
         </IonContent>
      </IonPage>
   )
}


export default Watched;