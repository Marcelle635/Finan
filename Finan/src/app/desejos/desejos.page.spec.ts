import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesejosPage } from './desejos.page';

describe('DesejosPage', () => {
  let component: DesejosPage;
  let fixture: ComponentFixture<DesejosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DesejosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
