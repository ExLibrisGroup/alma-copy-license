import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationComponent, ConfigurationGuard } from './configuration/configuration.component';
import { MainComponent } from './main/main.component';
import { ViewLicenseComponent } from './view-license/view-license.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'config', component: ConfigurationComponent, canDeactivate: [ConfigurationGuard] },
  { path: 'view', component: ViewLicenseComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
