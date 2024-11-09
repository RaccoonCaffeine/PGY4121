// map.service.ts
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor() { }

  loadMap(): Promise<any> {
    const windowObj = window as any;
    const mapModule = windowObj.google;
    if (mapModule && mapModule.maps) {
      return Promise.resolve(mapModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googlemap.apiKey;
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