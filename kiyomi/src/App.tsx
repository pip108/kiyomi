import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonContent, IonHeader, IonPage, IonRouterOutlet, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Season from './pages/Season';
import Watched from './pages/Watched';
import { UserStore } from './models/UserStore';
import { AnimeStore } from './models/AnimeStore';
import Toolbar from './components/Toolbar';
import AnimeList from './components/AnimeList';

const App: React.FC = () => {

   const [loading, setLoading] = useState(true);

   return (
      <IonApp>
         <IonReactRouter>
            <IonRouterOutlet>
               <Route exact path="/" component={Watched} />
               <Route path="/season" component={Season} />
            </IonRouterOutlet>
         </IonReactRouter>
      </IonApp>
   )
};

export default App;
