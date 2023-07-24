import {
  getFirestore
} from 'firebase/firestore';
import {
  collection,
  addDoc,
  getDocs,
  where,
  query,
  orderBy
} from "firebase/firestore"; 
import firebase from './FirebaseConfig';


const db = getFirestore(firebase);

const createDocument = (collectionName, document) => {
  return addDoc(collection(db, collectionName), {
    ...document
  });
}

const readDocuments = ({collectionName, queries, orderByField, orderByDirection}) => {
  let collectionRef = collection(db, collectionName);
  if(queries && queries.length) {
    for(const queryItem of queries) {
      collectionRef = query(
        collectionRef,
        where(
          queryItem.field,  queryItem.condition, queryItem.value
        )
      )
    }
  }

  if(orderByField && orderByDirection) {
    collectionRef = query(
      collectionRef,
      orderBy(
        orderByField,
        orderByDirection
      )
    )
  }
  return getDocs(collectionRef)
}

const updateDocument = (collectionName, id, document) => {
  return db.collection(collectionName).doc(id).update(document);
}

const deleteDocument = (collectionName, id) => {
  return db.collection(collectionName).doc(id).delete();
}

const FirebaseFirestoreService = () => ({
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument
})

export default FirebaseFirestoreService()