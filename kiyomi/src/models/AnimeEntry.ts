export interface AnimeEntry {
   id: number;
   main_picture: {
      medium: string;
      large: string;
   };
   title: string;
   watching: boolean;
   broadcast: {
      day_of_the_week: string;
      start_time: string;
   }
   average_episode_duration: number; // seconds
   adjusted_airtime: { hour: number, min: number }
   adjusted_weekday: number;
}