import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  template: `
    <button
      (click)="toggleDropdownVisibility()"
      class="settings-button"
      type="button"
    >
      <img class="settings-icon" src="../../assets/settings.svg" alt="" />
    </button>
    <div class="settings-dropdown">
      <button
        (click)="toggleDropdownVisibility()"
        (click)="changeUnitsClick()"
        class="dropdown-item"
        type="button"
      >
        <img
          src="../../assets/unit.svg"
          alt="Button to represent units of measurement"
          aria-hidden="true"
        />
        <p>Change Units</p>
      </button>
      <button
        class="dropdown-item"
        (click)="getCurrentLocationClick()"
        (click)="toggleDropdownVisibility()"
        type="button"
      >
        <img src="../assets/location.svg" alt="get my location icon" />
        <p>Get current location</p>
      </button>
    </div>
  `,
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  @Output() changeUnits = new EventEmitter<void>();
  @Output() getCurrentLocation = new EventEmitter<void>();

  changeUnitsClick() {
    this.changeUnits.emit();
  }

  getCurrentLocationClick() {
    this.getCurrentLocation.emit();
  }

  toggleDropdownVisibility() {
    const dropdown = document.querySelector('.settings-dropdown');
    dropdown?.classList.toggle('show');
  }
}
