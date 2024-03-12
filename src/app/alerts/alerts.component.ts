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
      <div class="alerts-container">
        <div *ngFor="let alert of alerts.sort(sortAlerts)">
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
            <p class="headline">{{ alert.headline }}</p>
          </div>
          <div class="second-line">
            <p class="instruction">{{ alert.instruction }}</p>
          </div>
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

  sortAlerts(a: Alert, b: Alert): number {
    const severityOrder: string[] = ['Moderate', 'Severe', 'Extreme'];

    // Get the sort order priorities for the two alerts
    const aSeverityOrder = severityOrder.indexOf(a.severity) || 0;
    const bSeverityOrder = severityOrder.indexOf(b.severity) || 0;

    // Sort based on the order priorities
    return bSeverityOrder - aSeverityOrder;
  }
}
