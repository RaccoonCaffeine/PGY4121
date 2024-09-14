import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.page.html',
  styleUrls: ['./reset-pass.page.scss'],
})
export class ResetPassPage{
  resetForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private navCtrl: NavController) { // Inyectar dependencias
    // Crear el formulario
    this.resetForm = this.formBuilder.group({
      // Campos del formulario:
      username:
      ['',
        [
          Validators.required, // Campo requerido
          Validators.minLength(3), // Mínimo 3 caracteres
          Validators.maxLength(8), // Máximo 8 caracteres
          Validators.pattern('^[a-zA-Z0-9]+$'), // Solo alfanumérico
        ],
      ]
    });
  }
    onReset() { // Método para enviar el formulario
      if (this.resetForm.valid) {
        const username = this.resetForm.get('username')?.value;
  
        // Navegar a la página Home y pasar datos
        this.navCtrl.navigateForward('/login', {
          queryParams: { username },
        });
      } else {
        console.log('Formulario inválido');
      }
    }
}
