import { IonImg, IonItem, IonLabel, IonThumbnail } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { AnimeEntry } from '../models/AnimeEntry';
import { DateUtil } from '../util/DateUtil';
import Countdown from './Countdown';

import './WatchedItem.css'

interface WatchedItemProps {
   anime: AnimeEntry;
   loaded: () => void;
}

const WatchedItem: React.FC<WatchedItemProps> = props => {

   const [searchTerm, setSearchTerm] = useState('');
   const [showCountdown, setShowCountdown] = useState(false);
   const [notYetAired, setNotYetAired] = useState(false);
   const [finishedAiring, setFinishedAiring] = useState(false);


   useEffect(() => {
      let parts = props.anime.title.replace(/[^aA-zZ\s0-9]/g, ' ').split(' ');
      parts = parts.length > 2 ? parts.reverse().slice(parts.length - 2).reverse() : parts;
      setSearchTerm(parts.join('+'));
   }, [props.anime.title]);

   useEffect(() => {
      const date = new Date();
      setShowCountdown(date.getDay() === props.anime.adjusted_weekday);
      setFinishedAiring(date > DateUtil.getAirDate(props.anime.end_date));
      setNotYetAired(date < DateUtil.getAirDate(props.anime.end_date));
   }, [props.anime.adjusted_weekday]);

   useEffect(() => {
      props.loaded()
   }, [props])

   return (
      <IonItem>
         <IonThumbnail>
            <IonImg src={props.anime.main_picture.medium}></IonImg>
         </IonThumbnail>
         <IonLabel className="watched-label">
            <h2>
               {(!notYetAired && !finishedAiring) && 
               <span>
                  {DateUtil.padNumber(props.anime.adjusted_airtime.hour)}:
                  {DateUtil.padNumber(props.anime.adjusted_airtime.min)}
               </span>
               }
               {showCountdown &&
                  <span> - <Countdown anime={props.anime} /></span>}
            </h2>
            <h3><strong>{props.anime.title}</strong></h3>
            <p>
               <a target="_blank" rel="noopener noreferrer" href={`https://nyaa.si/?f=0&c=1_2&q=${searchTerm}`}>Search nyaa.si</a>
            </p>
         </IonLabel>
      </IonItem>
   )
}

export default WatchedItem;