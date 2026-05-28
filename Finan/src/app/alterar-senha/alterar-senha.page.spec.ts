import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlterarSenhaPage } from './alterar-senha.page';

describe('AlterarSenhaPage', () => {
  let component: AlterarSenhaPage;
  let fixture: ComponentFixture<AlterarSenhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlterarSenhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
