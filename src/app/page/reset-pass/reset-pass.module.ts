import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ResetPassPageRoutingModule } from './reset-pass-routing.module';
import { ResetPassPage } from './reset-pass.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetPassPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ResetPassPage]
})
export class ResetPassPageModule {}
