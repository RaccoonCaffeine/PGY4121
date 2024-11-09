import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { emailVerified } from '@angular/fire/auth-guard';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  registerForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private userService: UserService,private router: NavController) {
    // Inyectar dependencias
    // Crear el formulario
    this.registerForm = this.formBuilder.group({
      // Campos del formulario:
      email: [
        '',
        [
          Validators.required, // Campo requerido
          Validators.minLength(15), // Mínimo 6 caracteres
          Validators.maxLength(50), // Máximo 15 caracteres
          Validators.email, // Formato email
        ],
      ],
      username: [
        '',
        [
          Validators.required, // Campo requerido
          Validators.minLength(15), // Mínimo 6 caracteres
          Validators.maxLength(50), // Máximo 15 caracteres
          Validators.pattern('^[a-zA-Z0-9]+$'), // Solo alfanumérico
        
        ],
      ],
      password: [
        '',
        [
          Validators.required, // Campo requerido
          Validators.minLength(6), // Mínimo 6 caracteres
          Validators.maxLength(15), // Máximo 15 caracteres
          Validators.pattern('^[a-zA-Z0-9]+$'), // Solo alfanumérico
        ],
      ],
    });
  }

  async onRegister(){
    if(this.registerForm.valid){
      const email = this.registerForm.get('email')?.value;
      const username = this.registerForm.get('username')?.value;
      const password = this.registerForm.get('password')?.value;
      try{
        await this.userService.registerUser(email, password);
        console.log('Usuario registrado');
        await this.userService.createUserProfile(username);
        this.router.navigateForward(['/login']);
      }catch(error){
        console.log('Error al registrar el usuario', error);
      }
    }else{
      console.log('Formulario inválido');
    }
  }
  navigateToLogin(){
    this.router.navigateForward(['/login']);
  }
  navigateToReset(){
    this.router.navigateForward(['/reset-pass']);
  }
}