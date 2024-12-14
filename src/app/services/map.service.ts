import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(private platform: Platform) { }

  async getCurrentPosition() {
    try {
      // Solicitar permisos primero
      await this.requestLocationPermissions();
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true // Para mejor precisión
      });
      return coordinates;
    } catch (error) {
      console.error('Error getting location', error);
      throw error;
    }
  }

  private async requestLocationPermissions() {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        await Geolocation.requestPermissions();
      }
    } catch (error) {
      console.error('Error requesting permissions', error);
      throw error;
    }
  }

  loadMap(): Promise<any> {
    const windowObj = window as any;
    const mapModule = windowObj.google;
    if (mapModule && mapModule.maps) {
      return Promise.resolve(mapModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googlemap.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedMapModule = windowObj.google;
        if (loadedMapModule && loadedMapModule.maps) {
          resolve(loadedMapModule.maps);
        } else {
          reject('Google maps not available');
        }
      };
      script.onerror = () => {
        reject('Error loading Google Maps script');
      };
    });
  }
}