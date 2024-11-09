import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private db = inject(Firestore);
  constructor() { }

  getParkingLots(){
    const parkingLotsCollection = collection(this.db, 'parkingLots');
    return collectionData(parkingLotsCollection);
  }    
}
