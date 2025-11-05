//#region Firebase e Firestore

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
  doc,
  updateDoc,
  increment,
  getFirestore,
  collection,
  addDoc,
  orderBy,
  query,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdh_N-ksAL2iAGrKR0dxeD2qt23Cev18s",
  authDomain: "leave-a-message-xd.firebaseapp.com",
  projectId: "leave-a-message-xd",
  storageBucket: "leave-a-message-xd.firebasestorage.app",
  messagingSenderId: "598875417932",
  appId: "1:598875417932:web:5d11a1626be1ff5fed33e9",
  measurementId: "G-GYQWPY3W0J"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//#endregion

//#region Criar Mensagem
const mensagensFeitas = document.getElementById("mensagens-feitas");
const caixaDeMensagensBox = document.getElementById("caixa-de-mensagens-box");
const caixaDeMensagensButton = document.getElementById("caixa-de-mensagens-button");
const inputNome = document.querySelector(".nickname");

function criarMensagem(mensagemTexto, nomeUsuario, numeroLikes = 0, docId) {
  const divMensagem = document.createElement("div");
  divMensagem.classList.add("mensagem-individual");

  const pMensagem = document.createElement("p");
  pMensagem.textContent = mensagemTexto;

  const divAlinhamento = document.createElement("div");
  divAlinhamento.classList.add("alinhamento");

  const divEsquerda = document.createElement("div");
  divEsquerda.classList.add("info-esquerda");

  const imgLike = document.createElement("img");
  imgLike.src = "icons/like.png";
  imgLike.classList.add("botao-like");

  const spanLikes = document.createElement("span");
  spanLikes.classList.add("numero-likes");
  spanLikes.textContent = numeroLikes;

  divEsquerda.appendChild(imgLike);
  divEsquerda.appendChild(spanLikes);

  const spanNome = document.createElement("span");
  spanNome.classList.add("nome");
  spanNome.textContent = nomeUsuario;

  divAlinhamento.appendChild(divEsquerda);
  divAlinhamento.appendChild(spanNome);

  divMensagem.appendChild(pMensagem);
  divMensagem.appendChild(divAlinhamento);

  mensagensFeitas.appendChild(divMensagem);

  let curtiu = false;

  imgLike.addEventListener("click", () => {
    if (!curtiu) {
      curtirComentario(docId, spanLikes);
      imgLike.src = "icons/liked.png";
      curtiu = true;
    }
  });
}
//#endregion

//#region Carregar Mensagens em tempo real
const q = query(collection(db, "Pessoas"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  mensagensFeitas.innerHTML = ""; // limpa mensagens atuais
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.mensagem) {
      criarMensagem(data.mensagem, data.nome, data.likes || 0, docSnap.id);
    }
  });
});
//#endregion

//#region Enviar mensagem
async function enviarMensagem() {
  const texto = caixaDeMensagensBox.value.trim();
  const nome = inputNome.value.trim() || "Anônimo";

  if (texto === "") return;

  try {
    await addDoc(collection(db, "Pessoas"), {
      mensagem: texto,
      nome: nome,
      likes: 0,
      timestamp: Date.now()
    });

    // Limpa inputs após enviar
    caixaDeMensagensBox.value = "";
    inputNome.value = "";

  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
}
//#endregion

//#region Curtir Comentário
async function curtirComentario(docId, spanLikes) {
  const docRef = doc(db, "Pessoas", docId);
  const curtiu = localStorage.getItem(`curtiu_${docId}`);

  if (curtiu) {
    try{
      await updateDoc(docRef,{
        likes: increment(-1)
      });
      spanLikes.textContent=Number(spanLikes.textContent)-1;
      localStorage.removeItem()
    }catch(err){
      console.error("Erro ao descutir comentario");
    }

  } else {
    try {
      await updateDoc(docRef, {
        likes: increment(1)
      });
      spanLikes.textContent = Number(spanLikes.textContent) + 1;
      localStorage.setItem(`curtiu_${docId}`, "true");
    } catch (err) {
      console.error("Erro ao curtir comentário", err);
    }
  }
}
//#endregion

//#region Tema 
const interruptoresCol = collection(db, "Luz");
const tema = document.getElementById("tema");
onSnapshot(interruptoresCol, (snapshot) => {
  if (!snapshot.empty) {
    const ligado = snapshot.docs[0].data().check;
    document.documentElement.setAttribute('data-theme', ligado ? 'light' : 'dark');
    if (ligado) {
      tema.src = "icons/light.png";
    } else {
      tema.src = "icons/dark.png";
    }
  }
});

async function mudarTema() {
  try {
    const docRef = doc(db, "Luz", "interruptor");

    const docSnap = await getDoc(docRef);
    const currentCheck = docSnap.data().check;

    await updateDoc(docRef, {
      check: !currentCheck
    });

  } catch (err) {
    console.error("Erro ao trocar de tema:", err);
  }
}
//#endregion

//#region Eventos
caixaDeMensagensBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") enviarMensagem();
});

caixaDeMensagensButton.addEventListener("click", enviarMensagem);

tema.addEventListener("click", mudarTema);
//#endregion


