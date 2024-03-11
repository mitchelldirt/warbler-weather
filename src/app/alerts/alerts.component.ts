import {
  Component,
  Input,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { Coordinates } from '../coordinates';
import { WeatherService } from '../weather.service';
import { Alert } from '../alert';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="component-container" *ngIf="alerts.length > 0">
      <div class="alerts-container" *ngFor="let alert of alerts">
        <div class="first-line">
          <img
            *ngIf="alert.severity === 'Moderate'"
            src="../../assets/advisory.svg"
            alt="warning icon"
            aria-hidden="true"
          />
          <img
            *ngIf="alert.severity !== 'Moderate'"
            src="../../assets/alert.svg"
            alt="warning icon"
            aria-hidden="true"
          />
          <p>{{ alert.headline }}</p>
        </div>
        <div class="second-line">
          <p>{{ alert.instruction }}</p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './alerts.component.css',
})
export class AlertsComponent implements OnInit, OnChanges {
  @Input() coordinates!: Coordinates;
  weatherService: WeatherService = inject(WeatherService);
  alerts: Alert[] = [];

  ngOnInit() {
    this.fetchAlerts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['coordinates']) {
      this.fetchAlerts();
    }
  }

  fetchAlerts() {
    if (this.coordinates) {
      this.weatherService
        .getAlerts(this.coordinates)
        .then((alerts: Alert[]) => {
          this.alerts = alerts;
        });
    }
  }
}
