import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';  // ReactiveFormsModule'u import edin
import { RegistrationComponent } from './components/registration/registration.component';
import { HttpClientModule } from '@angular/common/http';
import { CalendarModule } from 'primeng/calendar';  // PrimeNG Calendar modülünü import edin
import { ButtonModule } from 'primeng/button';  // PrimeNG Button modülünü import edin
import { InputTextModule } from 'primeng/inputtext';
import { HomepageComponent } from './components/homepage/homepage.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    HomepageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,  // ReactiveFormsModule'u buraya ekleyin
    HttpClientModule,
    BrowserAnimationsModule,
    CalendarModule,  // PrimeNG Calendar modülünü buraya ekleyin
    ButtonModule,  // PrimeNG Button modülünü buraya ekleyin
    InputTextModule  // PrimeNG Input modülünü buraya ekleyin
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
