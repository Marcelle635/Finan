import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {}

  async cadastrar(email: string, senha: string) {
    // O segredo é o await aqui para esperar o Firebase responder
    return await createUserWithEmailAndPassword(this.auth, email, senha);
  }

  async login(email: string, senha: string) {
    return await signInWithEmailAndPassword(this.auth, email, senha);
  }

  async logout() {
    return await signOut(this.auth);
  }
}