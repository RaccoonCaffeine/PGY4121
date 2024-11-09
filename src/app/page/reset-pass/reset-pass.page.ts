import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NavController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.page.html',
  styleUrls: ['./reset-pass.page.scss'],
})
export class ResetPassPage{
  resetForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private navCtrl: NavController,private userServices: UserService) { // Inyectar dependencias
    // Crear el formulario
    this.resetForm = this.formBuilder.group({
      // Campos del formulario:
      username:
      ['',
        [
          Validators.required, // Campo requerido
          Validators.minLength(15), // Mínimo 6 caracteres
          Validators.maxLength(50), // Máximo 15 caracteres
          Validators.email, // Formato email
        ],
      ]
    });
  }
    onReset() { // Método para enviar el formulario
      if (this.resetForm.valid) {
        const username = this.resetForm.get('username')?.value;
        this.userServices.resetPassword(username).then(() => {
          console.log('Correo enviado');
          this.navCtrl.navigateForward(['/login']);
        }).catch((error) => {
          console.log('Error al enviar el correo', error);
        });
      }
    }
    navigateToLogin() {
      this.navCtrl.navigateForward(['/login']);
    }
}
