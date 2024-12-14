import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, authState } from '@angular/fire/auth';
import { doc, setDoc, getFirestore, collectionData, Firestore, getDoc, collection, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private auth: Auth) {}
  private db = inject(Firestore);

  registerUser(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login({email, password}: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async createUserProfile(user: any) {
    try {
      const userRef = doc(this.db, 'users', user.uid);
      await setDoc(userRef, {
        username: user.username,
        email: user.email,
        rol: 'user',
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  userState() {
    return authState(this.auth);
  }

  getUserProfile(uid: string): Observable<any> {
    const userDoc = doc(this.db, 'users', uid);
    return from(getDoc(userDoc)).pipe(
      map(doc => {
        if (doc.exists()) {
          return { id: doc.id, ...doc.data() };
        } else {
          return null;
        }
      })
    );
  }

  getParkingLots(): Observable<any[]> {
    const parkingLotsCollection = collection(this.db, 'parkingLots');
    return collectionData(parkingLotsCollection, { idField: 'id' });
  }

  async addParkingLot(parkingLot: any) {
    const parkingLotsCollection = collection(this.db, 'parkingLots');
    try {
      await addDoc(parkingLotsCollection, parkingLot);
    } catch (error) {
      console.error('Error adding parking lot:', error);
      throw error;
    }
  }

  async updateParkingLot(id: string, parkingLot: any) {
    const parkingDoc = doc(this.db, 'parkingLots', id);
    try {
      await updateDoc(parkingDoc, parkingLot);
    } catch (error) {
      console.error('Error updating parking lot:', error);
      throw error;
    }
  }

  async deleteParkingLot(id: string) {
    const parkingDoc = doc(this.db, 'parkingLots', id);
    try {
      await deleteDoc(parkingDoc);
    } catch (error) {
      console.error('Error deleting parking lot:', error);
      throw error;
    }
  }
}