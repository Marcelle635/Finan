import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, // 👈 Adicionado para o Google
  signInWithPopup     // 👈 Adicionado para abrir a janela de login
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {}

  // 👇 Novo método para o Login com o Google
  async loginComGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(this.auth, provider);
  }

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