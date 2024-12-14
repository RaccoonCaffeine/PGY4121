import { Component, ElementRef, OnInit, OnDestroy, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { NavController, AlertController } from '@ionic/angular';
import { MapService } from '../services/map.service';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

declare const google: any;

interface Location {
  id?: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  available: boolean;
  price?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapUser', { static: false }) mapUserElement?: ElementRef;
  @ViewChild('map', { static: false }) mapElement?: ElementRef;
  userMap: any;
  map: any;
  isMapVisible: boolean = false;
  selectedLocation: Location | null = null;
  currentUser: any = null;
  locations$: Observable<Location[]>;
  isAdmin: boolean = false;
  private locationUpdateInterval: any;
  private parkingMarkers: any[] = [];
  
  // Propiedades para paginación
  currentPage: number = 0;
  itemsPerPage: number = 3;
  totalPages: number = 0;
  displayedLocations: Location[] = [];
  allLocations: Location[] = [];

  constructor(
    private userService: UserService,
    private router: NavController,
    private mapService: MapService,
    private renderer: Renderer2,
    private firestore: Firestore,
    private alertController: AlertController
  ) {
    this.locations$ = this.userService.getParkingLots() as Observable<Location[]>;
    this.locations$.subscribe(locations => {
      this.allLocations = locations;
      this.totalPages = Math.ceil(locations.length / this.itemsPerPage);
      this.updateDisplayedLocations();
      if (this.userMap) {
        this.updateParkingMarkers();
      }
    });
    
    this.userService.userState().subscribe(user => {
      if (user) {
        this.userService.getUserProfile(user.uid).subscribe(userProfile => {
          this.currentUser = userProfile;
          this.isAdmin = userProfile?.rol === 'admin';
        });
      }
    });
  }

  ngOnInit() {
    this.checkLocationPermissions();
  }

  ngAfterViewInit() {
    this.loadUserMap();
  }

  ngOnDestroy() {
    this.stopLocationUpdates();
    this.clearParkingMarkers();
  }

  async checkLocationPermissions() {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location === 'prompt' || status.location === 'denied') {
        const request = await Geolocation.requestPermissions();
        if (request.location === 'granted') {
          await this.loadUserMap();
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }

  clearParkingMarkers() {
    this.parkingMarkers.forEach(markerInfo => {
      markerInfo.marker.setMap(null);
      markerInfo.infoWindow.close();
    });
    this.parkingMarkers = [];
  }

  updateParkingMarkers() {
    this.clearParkingMarkers();
    if (this.userMap) {
      this.mapService.loadMap().then(googleMaps => {
        this.addParkingMarkers(googleMaps);
      });
    }
  }

  updateDisplayedLocations() {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedLocations = this.allLocations.slice(start, end);
  }

  changePage() {
    this.updateDisplayedLocations();
  }

  onPageClick(event: Event, pageIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    this.currentPage = pageIndex;
    this.changePage();
  }

  async onlogout() {
    await this.userService.logout();
    this.router.navigateForward(['/login']);
  }

  async showLocationOnMap(location: Location) {
    this.selectedLocation = location;
    this.isMapVisible = true;
    setTimeout(() => {
      this.loadmap(location.coordinates);
    }, 100);
  }

  hideMap() {
    this.isMapVisible = false;
    this.selectedLocation = null;
  }

  async loadmap(coordinates: { lat: number, lng: number }) {
    if (!this.mapElement) {
      console.error('Map element not found');
      return;
    }

    try {
      const googleMaps = await this.mapService.loadMap();
      const mapEl = this.mapElement.nativeElement;
      const location = new googleMaps.LatLng(coordinates.lat, coordinates.lng);
      
      this.map = new googleMaps.Map(mapEl, {
        center: location,
        zoom: 16,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      const marker = new googleMaps.Marker({
        position: location,
        map: this.map,
        animation: googleMaps.Animation.DROP,
        title: this.selectedLocation?.name
      });

      const infoWindow = new googleMaps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 5px 0;">${this.selectedLocation?.name}</h3>
            <p style="margin: 0 0 5px 0;">${this.selectedLocation?.address}</p>
            <p style="margin: 0;">Precio: ${this.selectedLocation?.price}/hora</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
      
      this.renderer.addClass(mapEl, 'visible');
    } catch (error) {
      console.error('Error loading map:', error);
    }
  }

  async loadUserMap() {
    if (!this.mapUserElement) {
      console.error('User map element not found');
      return;
    }

    try {
      const coordinates = await this.mapService.getCurrentPosition();
      const googleMaps = await this.mapService.loadMap();
      const mapEl = this.mapUserElement.nativeElement;
      
      const userLocation = new googleMaps.LatLng(
        coordinates.coords.latitude,
        coordinates.coords.longitude
      );

      this.userMap = new googleMaps.Map(mapEl, {
        center: userLocation,
        zoom: 15,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Marcador del usuario
      const userMarker = new googleMaps.Marker({
        position: userLocation,
        map: this.userMap,
        icon: {
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Tu ubicación'
      });

      // Círculo alrededor de la ubicación del usuario
      new googleMaps.Circle({
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4285F4',
        fillOpacity: 0.35,
        map: this.userMap,
        center: userLocation,
        radius: 100
      });

      this.clearParkingMarkers();
      this.addParkingMarkers(googleMaps);

      this.renderer.addClass(mapEl, 'visible');
      this.startLocationUpdates();
    } catch (error) {
      console.error('Error loading user map:', error);
    }
  }

  addParkingMarkers(googleMaps: any) {
    this.allLocations.forEach(location => {
      const parkingLocation = new googleMaps.LatLng(
        location.coordinates.lat,
        location.coordinates.lng
      );

      const markerIcon = {
        path: googleMaps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: location.available ? '#4CAF50' : '#FF5252',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      };

      const marker = new googleMaps.Marker({
        position: parkingLocation,
        map: this.userMap,
        icon: markerIcon,
        title: location.name,
        animation: googleMaps.Animation.DROP
      });

      const infoWindow = new googleMaps.InfoWindow({
        content: this.createInfoWindowContent(location)
      });

      marker.addListener('click', () => {
        this.parkingMarkers.forEach(m => m.infoWindow.close());
        infoWindow.open(this.userMap, marker);
      });

      this.parkingMarkers.push({ marker, infoWindow, location });
    });
  }

  createInfoWindowContent(location: Location): string {
    return `
      <div style="padding: 10px;">
        <h3 style="margin: 0 0 5px 0; color: ${location.available ? '#4CAF50' : '#FF5252'}">
          ${location.name}
        </h3>
        <p style="margin: 0 0 5px 0;">${location.address}</p>
        <p style="margin: 0 0 5px 0;">Precio: ${location.price}/hora</p>
        <p style="margin: 0; font-weight: bold; color: ${location.available ? '#4CAF50' : '#FF5252'}">
          ${location.available ? '✓ Disponible' : '✕ No disponible'}
        </p>
      </div>
    `;
  }

  startLocationUpdates() {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }

    this.locationUpdateInterval = setInterval(async () => {
      try {
        const coordinates = await this.mapService.getCurrentPosition();
        const googleMaps = await this.mapService.loadMap();
        if (this.userMap) {
          const userLocation = new googleMaps.LatLng(
            coordinates.coords.latitude,
            coordinates.coords.longitude
          );
          this.userMap.setCenter(userLocation);
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }, 30000);
  }

  stopLocationUpdates() {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  getPageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i);
  }

  // Métodos CRUD para estacionamientos
  async addParkingLot() {
    const alert = await this.alertController.create({
      header: 'Agregar Estacionamiento',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del estacionamiento'
        },
        {
          name: 'address',
          type: 'text',
          placeholder: 'Dirección'
        },
        {
          name: 'lat',
          type: 'number',
          placeholder: 'Latitud'
        },
        {
          name: 'lng',
          type: 'number',
          placeholder: 'Longitud'
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio por hora'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            const newParking = {
              name: data.name,
              address: data.address,
              coordinates: {
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
              },
              available: true,
              price: parseFloat(data.price)
            };
            this.userService.addParkingLot(newParking);
          }
        }
      ]
    });

    await alert.present();
  }

  async editParkingLot(parking: Location) {
    const alert = await this.alertController.create({
      header: 'Editar Estacionamiento',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: parking.name,
          placeholder: 'Nombre del estacionamiento'
        },
        {
          name: 'address',
          type: 'text',
          value: parking.address,
          placeholder: 'Dirección'
        },
        {
          name: 'lat',
          type: 'number',
          value: parking.coordinates.lat,
          placeholder: 'Latitud'
        },
        {
          name: 'lng',
          type: 'number',
          value: parking.coordinates.lng,
          placeholder: 'Longitud'
        },
        {
          name: 'price',
          type: 'number',
          value: parking.price,
          placeholder: 'Precio por hora'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            const updatedParking = {
              name: data.name,
              address: data.address,
              coordinates: {
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng)
              },
              available: parking.available,
              price: parseFloat(data.price)
            };
            await this.userService.updateParkingLot(parking.id!, updatedParking);
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleAvailability(parking: Location) {
    const updatedParking = {
      ...parking,
      available: !parking.available
    };
    await this.userService.updateParkingLot(parking.id!, updatedParking);
    this.updateParkingMarkers();
  }

  async deleteParkingLot(parkingId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este estacionamiento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.userService.deleteParkingLot(parkingId);
          }
        }
      ]
    });

    await alert.present();
  }
}