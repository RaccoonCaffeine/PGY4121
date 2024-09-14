import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private navCtrl: NavController) { // Inyectar dependencias
   // Crear el formulario
    this.loginForm = this.formBuilder.group({
      // Campos del formulario:
      username:
      ['',
        [
          Validators.required, // Campo requerido
          Validators.minLength(3), // Mínimo 3 caracteres
          Validators.maxLength(8), // Máximo 8 caracteres
          Validators.pattern('^[a-zA-Z0-9]+$'), // Solo alfanumérico
        ],
      ],
      password: [
        '',
        [
          Validators.required, // Campo requerido
          Validators.minLength(4), // Mínimo 4 caracteres
          Validators.maxLength(4), // Máximo 4 caracteres
          Validators.pattern('^[0-9]+$'), // Solo numérico
        ],
      ],
    });
  }

  onLogin() { // Método para enviar el formulario
    // Verificar si el formulario es valido
    if (this.loginForm.valid) {
      // Obtener el valor del campo username
      const username = this.loginForm.get('username')?.value;
      // Navegar a la página Home y pasar datos
      this.navCtrl.navigateForward('/home', {
        // Pasar el username como parámetro de la URL
        queryParams: { username },
      });
    } else {
      console.log('Formulario inválido');
    }
  }
}
