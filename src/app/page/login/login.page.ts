import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder, 
    private router: NavController, 
    private auth: Auth, 
    private userService: UserService,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(50),
          Validators.email,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
          Validators.pattern('^[a-zA-Z0-9]+$'),
        ],
      ],
    });
  }

  // Método para mostrar mensajes de error
  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: color
    });
    toast.present();
  }

  // Método para obtener mensaje de error específico del email
  getEmailErrorMessage(): string {
    const control = this.loginForm.get('username');
    if (control?.errors) {
      if (control.errors['required']) return 'El correo electrónico es requerido';
      if (control.errors['minlength']) return 'El correo debe tener al menos 15 caracteres';
      if (control.errors['maxlength']) return 'El correo no debe exceder 50 caracteres';
      if (control.errors['email']) return 'Ingrese un correo electrónico válido';
    }
    return '';
  }

  // Método para obtener mensaje de error específico de la contraseña
  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (control?.errors) {
      if (control.errors['required']) return 'La contraseña es requerida';
      if (control.errors['minlength']) return 'La contraseña debe tener al menos 6 caracteres';
      if (control.errors['maxlength']) return 'La contraseña no debe exceder 15 caracteres';
      if (control.errors['pattern']) return 'La contraseña solo debe contener letras y números';
    }
    return '';
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;
      
      try {
        await this.userService.login({email: username, password});
        await this.presentToast('Inicio de sesión exitoso', 'success');
        this.router.navigateForward(['/home']);
      } catch (error: any) {
        let errorMessage = 'Error al iniciar sesión';
        
        // Manejar diferentes tipos de errores de Firebase
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo electrónico';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Por favor, intente más tarde';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifique su conexión a internet';
            break;
        }
        
        await this.presentToast(errorMessage);
      }
    } else {
      // Mostrar errores específicos de validación
      if (this.loginForm.get('username')?.errors) {
        await this.presentToast(this.getEmailErrorMessage());
      } else if (this.loginForm.get('password')?.errors) {
        await this.presentToast(this.getPasswordErrorMessage());
      } else {
        await this.presentToast('Por favor, complete todos los campos correctamente');
      }
      
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  navigateToRegister(){
    this.router.navigateForward(['/registro']);
  }
  navigateToReset(){
    this.router.navigateForward(['/reset-pass']);
  }
}