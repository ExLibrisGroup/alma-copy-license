import { Component, Injectable, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { configurationFormGroup } from '../models/configuration';
import { ConfigurationService } from '../services/configuration.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogService } from 'eca-components';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  form: FormGroup;
  saving = false;
  
  constructor(
    private configurationService: ConfigurationService,
  ) { }

  ngOnInit() {
    this.configurationService.get().subscribe(configuration => {
      this.form = configurationFormGroup(configuration);
    });
  }

  save() {
    this.saving = true;
    this.configurationService.set(this.form.value)
    .pipe(finalize(() => this.saving = false))
    .subscribe(
      () => this.form.markAsPristine()
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationGuard implements CanDeactivate<ConfigurationComponent> {
  constructor(
    private dialog: DialogService,
  ) {}

  canDeactivate(component: ConfigurationComponent): Observable<boolean> {
    if(!component.form.dirty) return of(true);
    return this.dialog.confirm({ 
      text: _('CONFIGURATION.DISCARD'),
      ok: _('CONFIGURATION.DISCARD_OK')
    });
  }
}