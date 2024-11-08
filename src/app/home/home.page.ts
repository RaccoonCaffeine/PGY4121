import { Component, ElementRef, OnInit, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { NavController, AlertController } from '@ionic/angular';
import { MapService } from '../services/map.service';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement?: ElementRef;
  map: any;
  isMapVisible: boolean = false;
  selectedLocation: Location | null = null;
  currentUser: any = null;
  locations$: Observable<Location[]>;
  isAdmin: boolean = false;
  
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

  ngOnInit() {}

  ngAfterViewInit() {}

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

  onlogout() {
    this.userService.logout();
    this.router.navigateForward(['/home']);
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

  getPageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i);
  }
}