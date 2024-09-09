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

  constructor(private formBuilder: FormBuilder, private navCtrl: NavController) {
    this.resetForm = this.formBuilder.group({
      username:
      ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(8),
          Validators.pattern('^[a-zA-Z0-9]+$'), // Solo alfanumérico
        ],
      ]
    });
  }
    onReset() {
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
