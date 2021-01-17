import { IonSpinner } from '@ionic/react';
import React from 'react';

const Loading: React.FC = () => (
   <div style={
      {
         width: '100%',
         height: '100%',
         display: 'flex'
      }
   }>
      <div style={ { flexGrow: 1 }}></div>
      <IonSpinner style={
         {
            marginTop: '40px',
            transform: 'scale(1.5)'
         }
      }></IonSpinner>
      <div style={{ flexGrow: 1 }}></div>
   </div>
)

export default Loading;
