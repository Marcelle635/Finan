import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CasaPage } from './casa.page';

describe('CasaPage', () => {
  let component: CasaPage;
  let fixture: ComponentFixture<CasaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CasaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
