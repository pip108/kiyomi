import { IonButton, IonButtons, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { Constants } from '../models/Constants';
import { User, UserStore } from '../models/UserStore';
import { personCircleOutline } from 'ionicons/icons'
import './Toolbar.css';
import { tap } from 'rxjs/operators';
import { AnimeStore } from '../models/AnimeStore';

export interface ToolbarProps {
   showFilter: boolean;
}

const Toolbar: React.FC<ToolbarProps> = props => {

   const [user, setUser] = useState<User | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [userNameValue, setUserNameValue] = useState(user?.name || '');
   const [filterValue, setFilterValue] = useState('');

   useEffect(() => {
      const s = UserStore.user$.pipe(tap(u =>
         setUserNameValue(u?.name || '')
      )).subscribe(setUser);
      return () => s.unsubscribe();
   }, [])

   const setUserClick = async () => {
      if (user) {
         UserStore.setUser(user);
      } else {
         if (!(await UserStore.getUserByName(userNameValue))) {
            UserStore.setUser({ id: 0, name: userNameValue, watching: [] })
         }
      }
      closeUserModal();
   }

   const openUserModal = () => {
      setShowModal(true);
   }

   const closeUserModal = () => {
      setShowModal(false);
   }

   const filter = (str: string) => {
      AnimeStore.setFilter(str);
      setFilterValue(str);
   }

   const handleKeyPress = (key: string) => {
      if (key === 'Enter') {
         setUserClick();
      }
   }

   return (
      <IonToolbar>
         <IonModal
            isOpen={showModal}
            onDidDismiss={closeUserModal}
            cssClass="user-modal">
            <IonItem>
               <IonLabel>User</IonLabel>
               <IonInput autofocus={true} value={userNameValue} onIonChange={e => setUserNameValue(e.detail.value!)}
                  onKeyPress={e => handleKeyPress(e.key)} />
               <IonButton onClick={setUserClick}>Login or Create</IonButton>
            </IonItem>
         </IonModal>
         <IonTitle slot="start">{Constants.AppName}</IonTitle>
         <IonButtons slot="secondary">
            {props.showFilter && <IonInput value={filterValue} onIonChange={e => filter(e.detail.value!)} placeholder="Filter"></IonInput>}
            <IonButton routerLink="/">Watched</IonButton>
            <IonButton routerLink="/season">Season</IonButton>
            <IonButton onClick={openUserModal}><IonIcon icon={personCircleOutline} size="large" color={user ? 'primary' : 'medium'} /></IonButton>
         </IonButtons>
      </IonToolbar>
   );
}

export default Toolbar;