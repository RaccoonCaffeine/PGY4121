import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {

  constructor(
    private platform: Platform,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      setTimeout(() => { // Simula un retardo para el splash screen
      this.router.navigateByUrl('/login'); // Redirigir al login después de la pantalla de splash
      }, 3000); // Duración de la animación del splash en milisegundos
    });
  }
}