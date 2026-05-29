import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged // 👈 Importante: Escuta mudanças de usuário
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  constructor() {
    // 👇 SISTEMA DE ESCUTA EM TEMPO REAL: Toda vez que o app abrir ou o usuário mudar,
    // ele atualiza o 'usuario_logado' automaticamente com base na conta ativa.
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        if (user.displayName) {
          // Se for login por Google, usa o nome do Google
          localStorage.setItem('usuario_logado', user.displayName);
        } else if (user.email) {
          // Se for login por e-mail e senha, busca na lista mestre local
          const usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
          const usuarioEncontrado = usuariosCadastrados.find((u: any) => u.email.toLowerCase() === user.email?.toLowerCase());

          if (usuarioEncontrado && usuarioEncontrado.nome) {
            localStorage.setItem('usuario_logado', usuarioEncontrado.nome);
          } else {
            // Caso não tenha nome cadastrado, usa a primeira parte do e-mail
            localStorage.setItem('usuario_logado', user.email.split('@')[0]);
          }
        }
      } else {
        // Se deslogou completamente, limpa a chave para não deixar rastros do usuário anterior
        localStorage.removeItem('usuario_logado');
      }
    });
  }

  // Getter que as páginas usam para ler o estado do usuário logado no Firebase
  get obterAuth() {
    return this.auth;
  }

  // Login com o Google
  async loginComGoogle() {
    const provider = new GoogleAuthProvider();
    const resultado = await signInWithPopup(this.auth, provider);
    
    // Força a gravação imediata pós-clique
    if (resultado?.user?.displayName) {
      localStorage.setItem('usuario_logado', resultado.user.displayName);
    }
    return resultado;
  }

  // Cadastro de novos usuários
  async cadastrar(email: string, senha: string) {
    return await createUserWithEmailAndPassword(this.auth, email, senha);
  }

  // Login tradicional
  async login(email: string, senha: string) {
    const credencial = await signInWithEmailAndPassword(this.auth, email, senha);
    
    // Força a busca imediata do nome correto correspondente ao e-mail inserido
    const usuariosCadastrados = JSON.parse(localStorage.getItem('app_usuarios_cadastrados') || '[]');
    const usuarioEncontrado = usuariosCadastrados.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (usuarioEncontrado && usuarioEncontrado.nome) {
      localStorage.setItem('usuario_logado', usuarioEncontrado.nome);
    } else {
      localStorage.setItem('usuario_logado', email.split('@')[0]);
    }
    
    return credencial;
  }

  // Logout do sistema (Unificado como 'logout')
  async logout() {
    localStorage.removeItem('usuario_logado'); // Limpa imediatamente
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