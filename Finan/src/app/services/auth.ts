import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword // 👈 IMPORTANTE: Adicione esta importação do Firebase
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {}

  async loginComGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(this.auth, provider);
  }

  async cadastrar(email: string, senha: string) {
    return await createUserWithEmailAndPassword(this.auth, email, senha);
  }

  async login(email: string, senha: string) {
    return await signInWithEmailAndPassword(this.auth, email, senha);
  }

  async logout() {
    return await signOut(this.auth);
  }

  async redefinirSenha(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  // 👇 NOVO MÉTODO: Altera a senha do usuário atualmente autenticado
  async atualizarSenha(novaSenha: string) {
    const usuarioAtual = this.auth.currentUser;
    if (usuarioAtual) {
      return await updatePassword(usuarioAtual, novaSenha);
    } else {
      throw new Error('Nenhum usuário autenticado no Firebase.');
    }
  }
}