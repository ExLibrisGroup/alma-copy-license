import { Component, Injectable, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
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
    private dialog: DialogService,
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

  addInstCode() {
    this.dialog.prompt({
      title: _('CONFIGURATION.INST_CODES.ADD'),
    })
    .subscribe((instCode: string) => {
      if (!instCode) return;
        this.instCodes.push(new FormControl(instCode));
        this.instCodes.markAsDirty();
    })
  }

  removeInstCode(index: number) {
    this.instCodes.removeAt(index);
    this.instCodes.markAsDirty();
  }

  get instCodes() {
    return this.form.controls.instCodes as FormArray;
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