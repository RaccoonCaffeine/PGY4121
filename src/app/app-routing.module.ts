import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) // Carga el módulo home
  },
  {
    path: '', // Ruta raíz
    redirectTo: 'splash',  // Redirige primero al splash screen
    pathMatch: 'full' // La redirección es completa
  },
  {
    path: 'login',
    loadChildren: () => import('./page/login/login.module').then(m => m.LoginPageModule) // Carga el módulo login
  },
  {
    path: 'reset-pass',
    loadChildren: () => import('./page/reset-pass/reset-pass.module').then(m => m.ResetPassPageModule) // Carga el módulo reset-pass
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then(m => m.SplashPageModule) // Carga el módulo splash
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }