import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  template: `
    <button class="settings-button" type="button">
      <img class="settings-icon" src="../../assets/settings.svg" alt="" />
    </button>
  `,
  styleUrl: './settings.component.css',
})
export class SettingsComponent {}
