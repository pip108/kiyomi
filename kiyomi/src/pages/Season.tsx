import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import AnimeList from '../components/AnimeList';
import Toolbar from '../components/Toolbar';
import './Home.css';
import Loading from '../components/Loading';
import { AnimeStore } from '../models/AnimeStore';

const Season: React.FC = () => {

   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const s = AnimeStore.loading$.subscribe(setLoading);
      return () => s.unsubscribe();
   }, [])

   return (
      <IonPage>
         <IonHeader>
            <Toolbar></Toolbar>
         </IonHeader>
         <IonContent>
            <IonHeader collapse="condense">
               <IonToolbar>
                  <IonTitle size="large">{ }</IonTitle>
               </IonToolbar>
            </IonHeader>
            { loading && <Loading /> }
            { !loading && <AnimeList /> }
         </IonContent>
      </IonPage>
   );
};


export default Season;
