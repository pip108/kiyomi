import { IonCard, IonCheckbox } from '@ionic/react'
import React  from 'react'
import { UserStore } from '../models/UserStore';
import './AnimeCard.css';

interface ContainerProps {
   id: number;
   title: string;
   image: string;
   watching: boolean;
}

const AnimeCard: React.FC<ContainerProps> = props => {

   const click = () => {
      if (!props.watching) {
         UserStore.addWatched(props.id)
      } else {
         UserStore.removeWatched(props.id);
      }
   }
   
   return (
      <IonCard class="anime-card" button={true} onClick={click}>
         <div className="flex-container">
            <div className="card-image-container">
               <img src={props.image} className="anime-image" alt={'No image available'} />
            </div>
            <div className="card-content-container">
               <p className="checkbox">
                  <IonCheckbox checked={props.watching}></IonCheckbox> Watching
               </p>
               <p className="title">
                  <strong>{props.title}</strong>
               </p>
            </div>
         </div>
      </IonCard>
   )
}

export default AnimeCard;