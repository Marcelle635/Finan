import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {}

  // Getter que as páginas usam para ler o estado do usuário logado no Firebase
  get obterAuth() {
    return this.auth;
  }

  // Login com o Google
  async loginComGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(this.auth, provider);
  }

  // Cadastro de novos usuários
  async cadastrar(email: string, senha: string) {
    return await createUserWithEmailAndPassword(this.auth, email, senha);
  }

  // Login tradicional
  async login(email: string, senha: string) {
    return await signInWithEmailAndPassword(this.auth, email, senha);
  }

  // Logout do sistema (Unificado como 'logout')
  async logout() {
    return await signOut(this.auth);
  }

  // Método que a tela de Login usa para o "Esqueceu a senha?"
  async redefinirSenha(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  // Método que a tela Alterar Senha usa internamente
  async atualizarSenha(novaSenha: string) {
    const usuarioAtual = this.auth.currentUser;
    if (usuarioAtual) {
      return await updatePassword(usuarioAtual, novaSenha);
    } else {
      throw new Error('Nenhum usuário autenticado no Firebase.');
    }
  }
}