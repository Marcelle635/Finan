import { Component } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton],
})
export class HomePage { // O erro em err.PNG acontece se esse nome estiver diferente
  constructor() {}
}