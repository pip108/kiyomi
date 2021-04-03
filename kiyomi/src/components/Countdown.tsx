import React, { useEffect, useState } from 'react';
import { AnimeEntry } from '../models/AnimeEntry';
import { DateUtil } from '../util/DateUtil';

interface CountdownProps {
   anime: AnimeEntry
}

const Countdown: React.FC<CountdownProps> = props => {

   const [countdown, setCountdown] = useState<string>('');

   useEffect(() => {
      const calcCoundown = () => {
         const now = new Date();

         const airtimeSecondsFromMidnight = props.anime.adjusted_airtime.hour * 60 * 60
            + props.anime.adjusted_airtime.min * 60;
         const secondsFromMidnight = now.getHours() * 60 * 60
            + now.getMinutes() * 60 + now.getSeconds();
   
         // approximate 20min episodes if no data
         const duration = props.anime.average_episode_duration === 0 ? 1200 : 
            props.anime.average_episode_duration;
   
         let diff = airtimeSecondsFromMidnight - secondsFromMidnight;
         if (diff < 0) {
            if (diff + duration > 0) {
               return 'Airing';
            }
            return null;
         }
         const hours = Math.floor(diff / 60 / 60);
         diff -= hours * 60 * 60;
         const minutes = Math.floor(diff / 60);
         diff -= minutes * 60;
         return `${DateUtil.padNumber(hours)}:${DateUtil.padNumber(minutes)}:${DateUtil.padNumber(diff)}`;
      }

      let value = calcCoundown();
      if (!value) {
         setCountdown('Finished airing');
         return;
      }
      setCountdown(value);
      const i = setInterval(() => {
         const value = calcCoundown();
         if (value !== null) {
            setCountdown(value);
         } else {
            setCountdown('Finished airing');
            clearInterval(i);
         }
      }, 1000);
      return () => clearInterval(i);
   }, [
      props.anime.adjusted_airtime.hour,
      props.anime.adjusted_airtime.min,
      props.anime.average_episode_duration
   ]);

   return (
      <span>
         { countdown }
      </span>
   )
};

export default Countdown;