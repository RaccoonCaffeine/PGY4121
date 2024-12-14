import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder, 
    private userService: UserService,
    private router: NavController
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
      ]],
      username: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]+$'),
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]+$'),
      ]],
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const email = this.registerForm.get('email')?.value;
      const username = this.registerForm.get('username')?.value;
      const password = this.registerForm.get('password')?.value;
      
      try {
        // Registrar el usuario y obtener la respuesta
        const userCredential = await this.userService.registerUser(email, password);
        
        // Crear el objeto de usuario con todos los datos necesarios
        const userData = {
          uid: userCredential.user.uid,
          email: email,
          username: username
        };
        
        // Crear el perfil del usuario
        await this.userService.createUserProfile(userData);
        console.log('Usuario registrado exitosamente');
        this.router.navigateForward(['/login']);
      } catch (error) {
        console.error('Error al registrar el usuario', error);
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  navigateToLogin() {
    this.router.navigateForward(['/login']);
  }

  navigateToReset() {
    this.router.navigateForward(['/reset-pass']);
  }
}