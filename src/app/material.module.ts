import { NgModule } from '@angular/core';
import {CdkTableModule} from '@angular/cdk/table';

import {
  MatProgressBarModule,
  MatCardModule,
  MatIconModule,
  MatTableModule,
  MatInputModule,
  MatButtonModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatFormFieldModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatListModule,
  MatCheckboxModule,
  MatTabsModule,
  MatDialogModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatExpansionModule,
  MatMenuModule,
  MatBottomSheetModule,
} from '@angular/material';

export const MATERIAL_COMPONENTS = [
  MatCardModule,
  MatIconModule,
  MatTableModule,
  MatInputModule,
  MatButtonModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatFormFieldModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatListModule,
  MatProgressBarModule,
  CdkTableModule,
  MatCheckboxModule,
  MatTabsModule,
  MatDialogModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatExpansionModule,
  MatMenuModule,
  MatBottomSheetModule,
];

@NgModule({
  imports: [ MATERIAL_COMPONENTS ],
  exports: [ MATERIAL_COMPONENTS ],
})
export class MaterialModule { }
