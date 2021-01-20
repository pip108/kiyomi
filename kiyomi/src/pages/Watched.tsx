import { IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonPage, IonRouterLink, IonRow } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { map } from 'rxjs/operators';
import Loading from '../components/Loading';
import Toolbar from '../components/Toolbar';
import WatchedItem from '../components/WatchedItem';
import { AnimeEntry } from '../models/AnimeEntry';
import { AnimeStore } from '../models/AnimeStore';
import { DateUtil } from '../util/DateUtil';


const Watched: React.FC = () => {

   const weekday = (new Date()).getDay();


   const [days, setDays] = useState([] as {
      anime: AnimeEntry[],
      date: Date
   }[]);
   const showDays = 7;

   const [loading, setLoading] = useState(true);
   useEffect(() => {
      const s = AnimeStore.watchedLoading$.subscribe(setLoading);
      return () => s.unsubscribe();
   }, []);

   const [watchCount, setWatchCount] = useState(0);
   useEffect(() => {
      const s = AnimeStore.watched$
         .pipe(map(watched => {
            const set_days: { anime: AnimeEntry[], date: Date }[] = [];
            setWatchCount(watched.length);
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
   }, [weekday]);

   let childrenLoaded = 0;
   const [allChildrenLoaded, setAllChildrenLoaded] = useState(!days.some(x => x.anime.length > 0));
   const childLoaded = () => {
      childrenLoaded++;
      if (childrenLoaded === days.length) {
         setAllChildrenLoaded(true)
      }
   };


   return (
      <IonPage>
         <IonHeader>
            <Toolbar showFilter={false} />
         </IonHeader>
               <IonContent>
                  {loading &&
                     <Loading />
                  }
                  {!loading &&
                     <IonGrid>
                        <IonRow>
                           <IonCol offset="3" size="6">
                              {
                                 watchCount === 0 ?
                                 <p style={{textAlign: 'center'}}><strong><IonRouterLink href="/season">Add watched anime here</IonRouterLink></strong></p>
                                 :

                                 days.map((d, i) => <div key={d.date.getDate()}>
                                    {allChildrenLoaded &&
                                       <h1>
                                          {i === 0 ? 'Today (' : ''}
                                          {DateUtil.getDateLabel(d.date)}
                                          {i === 0 ? ')' : ''}
                                       </h1>
                                    }
                                    {
                                       d.anime.length > 0 ? d.anime.map(a => <WatchedItem
                                          loaded={childLoaded} anime={a} key={a.id}></WatchedItem>)
                                          : <IonItem>
                                             {
                                                allChildrenLoaded ?
                                                   <img src="assets/no_anime.png" style={{ width: '90px', height: '120px' }} alt="Nothing" />
                                                   : <div style={{ width: '90px', height: '120px' }}></div>
                                             }
                                             <IonLabel style={{ marginLeft: '20px ' }}>
                                                {allChildrenLoaded && <strong>Nothing (´-ω-`)</strong>}
                                             </IonLabel>
                                          </IonItem>
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