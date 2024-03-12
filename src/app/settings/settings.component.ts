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
      <img
        width="32"
        height="32"
        class="settings-icon"
        src="../../assets/settings.svg"
        alt=""
      />
    </button>
    <div class="settings-dropdown">
      <button
        aria-label="Settings"
        (click)="toggleDropdownVisibility()"
        (click)="changeUnitsClick()"
        class="dropdown-item"
        type="button"
      >
        <img
          width="24"
          height="24"
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
        <img
          width="24"
          height="24"
          src="../assets/location.svg"
          alt="get my location icon"
        />
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
