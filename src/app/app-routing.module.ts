import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const routes: Routes = [
  {
    path: '', // Ruta raíz
    redirectTo: 'splash',  // Redirige primero al splash screen
    pathMatch: 'full' // La redirección es completa
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),// Carga el módulo home
    ...canActivate(() => redirectUnauthorizedTo(['/login']) ) // Redirige a la página de login si no está autenticado
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule),
    ...canActivate(() => redirectLoggedInTo(['/home']) ) // Redirige a la página de home si está autenticado
  },
  {
    path: 'login',
    loadChildren: () => import('./page/login/login.module').then(m => m.LoginPageModule), // Carga el módulo login
    ...canActivate(() => redirectLoggedInTo(['/home']) ) // Redirige a la página de home si está autenticado
  },
  {
    path: 'reset-pass',
    loadChildren: () => import('./page/reset-pass/reset-pass.module').then(m => m.ResetPassPageModule), // Carga el módulo reset-pass
    ...canActivate(() => redirectLoggedInTo(['/home']) ) // Redirige a la página de home si está autenticado
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then(m => m.SplashPageModule) // Carga el módulo splash
  },
  {
    path: 'error',
    loadChildren: () => import('./page/error/error.module').then( m => m.ErrorPageModule)
  },
  {
    path: '**', // Cualquier otra ruta
    redirectTo: 'error', // Redirige primero al error screen
    pathMatch: 'full' // La redirección
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }