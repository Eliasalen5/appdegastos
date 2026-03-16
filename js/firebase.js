import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyB-XVV-cNS8YGCeR_DaohbngUE1pyALhtw",
  authDomain: "app-gastos-b153f.firebaseapp.com",
  projectId: "app-gastos-b153f",
  storageBucket: "app-gastos-b153f.firebasestorage.app",
  messagingSenderId: "828630647054",
  appId: "1:828630647054:web:aa4d0135a6ab904176575f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const gastosCollection = collection(db, 'gastos');

let gastos = [];

export function subscribeToGastos(callback) {
  const q = query(gastosCollection, orderBy('id', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    gastos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(gastos);
  });
}

export async function agregarGasto(gasto) {
  const docRef = await addDoc(gastosCollection, {
    ...gasto,
    id: Date.now().toString()
  });
  return docRef.id;
}

export async function eliminarGasto(id) {
  const gastoDoc = doc(db, 'gastos', id);
  await deleteDoc(gastoDoc);
}

export function getGastos() {
  return gastos;
}
