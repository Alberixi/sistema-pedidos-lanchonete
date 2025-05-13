import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  db,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  signInWithEmailAndPassword
} from './firebase-init.js';

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('user-info').innerText = `Olá, ${user.displayName || user.email}`;
    document.getElementById('login-section').style.display = 'none';
    document.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
  } else {
    document.getElementById('user-info').innerText = 'Login necessário';
  }
});

window.loginGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    alert("Erro ao logar com Google");
    console.error(error);
  }
};

window.toggleLoginForm = () => {
  const form = document.getElementById('email-login');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.loginEmailSenha = async () => {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado com sucesso!");
  } catch (error) {
    alert("Erro ao fazer login com email/senha");
    console.error(error);
  }
};

document.getElementById('form-cliente').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = e.target[0].value;
  const telefone = e.target[1].value;
  const endereco = e.target[2].value;

  await addDoc(collection(db, "clientes"), { nome, telefone, endereco });
  alert("Cliente cadastrado!");
});

window.adicionarPedido = async () => {
  const select = document.querySelector('#registro-pedido select');
  const quantidade = document.querySelector('#registro-pedido input[type="number"]').value;
  const formaPagamento = document.querySelector('[name="forma-pagamento"]').value;
  const troco = document.getElementById('troco').value;

  const item = select.options[select.selectedIndex].text;
  const status = 'pendente';

  const pedidoData = {
    cliente: 'cliente-exemplo',
    item,
    quantidade,
    formaPagamento,
    troco: troco || 'Não solicitado',
    status
  };

  await addDoc(collection(db, "pedidos"), pedidoData);

  const li = document.createElement('li');
  li.innerHTML = `
    ${item} x${quantidade} | Pagamento: ${formaPagamento}
    ${troco ? ` | Troco para R$${troco}` : ''}
    <select onchange="atualizarStatus(this, '${item}')">
      <option value="pendente" ${status === 'pendente' ? 'selected' : ''}>Pendente</option>
      <option value="em-preparo" ${status === 'em-preparo' ? 'selected' : ''}>Em Preparo</option>
      <option value="enviado" ${status === 'enviado' ? 'selected' : ''}>Enviado</option>
      <option value="concluido" ${status === 'concluido' ? 'selected' : ''}>Concluído</option>
    </select>
  `;
  document.getElementById('pedidos').appendChild(li);
};

window.atualizarStatus = async (el, item) => {
  const novoStatus = el.value;
  const q = query(collection(db, "pedidos"), where("item", "==", item));
  const snapshot = await getDocs(q);

  snapshot.forEach(async (docSnapshot) => {
    const pedidoRef = doc(db, "pedidos", docSnapshot.id);
    await updateDoc(pedidoRef, { status: novoStatus });
    alert(`Status atualizado para: ${novoStatus}`);
  });
};

window.imprimirPedidos = () => {
  const conteudo = document.getElementById('lista-pedidos').innerHTML;
  const janela = window.open('', '_blank');
  janela.document.write('<html><head><title>Imprimir Pedidos</title>');
  janela.document.write('</head><body>');
  janela.document.write(conteudo);
  janela.document.write('</body></html>');
  janela.document.close();
  janela.print();
};

document.getElementById('form-funcionario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = e.target[0].value;
  const telefone = e.target[1].value;

  await addDoc(collection(db, "funcionarios"), { nome, telefone });
  alert("Funcionário cadastrado!");
});

window.filtrarPedidos = async () => {
  const filtro = document.getElementById('filtro-status').value;
  const pedidosList = document.getElementById('lista-dashboard');
  pedidosList.innerHTML = '';

  const q = filtro ? query(collection(db, "pedidos"), where("status", "==", filtro)) : query(collection(db, "pedidos"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${data.item} - Status: ${data.status}`;
    pedidosList.appendChild(li);
  });
};
