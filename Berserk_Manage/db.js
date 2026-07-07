// Importando o Firebase (Note a nova função updateDoc adicionada)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// SUAS CHAVES DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAOlcXyTaf9B2lh7F75wU_MwfHEDntm5sc",
  authDomain: "berserk-38127.firebaseapp.com",
  projectId: "berserk-38127",
  storageBucket: "berserk-38127.firebasestorage.app",
  messagingSenderId: "316425109031",
  appId: "1:316425109031:web:9113569a7af69bda6a9802",
  measurementId: "G-GXSKB5FM99"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const BerserkDB = {
    async getItems(colecao) {
        const snapshot = await getDocs(collection(db, colecao));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async addItem(colecao, item) {
        await addDoc(collection(db, colecao), item);
    },

    async deleteItem(colecao, id) {
        await deleteDoc(doc(db, colecao, id));
    },

    // Nova função para atualizar um documento específico (Usado para a chamada de treinos)
    async updateItem(colecao, id, dados) {
        await updateDoc(doc(db, colecao, id), dados);
    },

    async getEstatisticas() {
        const docRef = await getDoc(doc(db, "configs", "estatisticas"));
        return docRef.exists() ? docRef.data() : { vitorias: 0, derrotas: 0 };
    },
    async updateEstatisticas(dados) {
        await setDoc(doc(db, "configs", "estatisticas"), dados);
    },

    async getFinanceiro() {
        const docRef = await getDoc(doc(db, "configs", "financeiro"));
        // Atualizado para os novos campos
        return docRef.exists() ? docRef.data() : { caixa: 0, receita: "-", proximoCusto: "-" };
    },
    async updateFinanceiro(dados) {
        await setDoc(doc(db, "configs", "financeiro"), dados);
    }
};