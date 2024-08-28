import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut} from 'firebase/auth'
import { addDoc, collection, getFirestore, getDocs, getDoc, doc, query, where } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

const FirebaseContext = createContext(null)
const firebaseConfig = {
    apiKey: "AIzaSyART8nU9cnpz6xiIAppRWexlndbrL_a6ao",
    authDomain: "bookify-fc8e2.firebaseapp.com",
    projectId: "bookify-fc8e2",
    storageBucket: "bookify-fc8e2.appspot.com",
    messagingSenderId: "128059490996",
    appId: "1:128059490996:web:ef70c4765203985c3b4de1",
    measurementId: "G-SB7WBKYKRT"
  };
export const useFirebase = () => useContext(FirebaseContext)
const firebaseApp = initializeApp(firebaseConfig)
const firebaseAuth = getAuth(firebaseApp)
const firestore = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)
const googleProvider = new GoogleAuthProvider()

export const FirebaseProvider = (props) => {
    const[user, setUser] = useState(null)
    useEffect(()=>{
        onAuthStateChanged(firebaseAuth, (user)=>{
            if(user) setUser(user)
            else setUser(null)
        })
    },[])
    const signupUserWithEmailAndPassword = (email, password)=>createUserWithEmailAndPassword(firebaseAuth, email, password)
    const signinUserWithEmailAndPassword = (email, password)=>signInWithEmailAndPassword(firebaseAuth, email, password)
    const signinWithGoogle =()=> signInWithPopup(firebaseAuth, googleProvider).then(user=>console.log(user))

    const handleSignOut =()=>{
        signOut(firebaseAuth).then(() => {
            // Sign-out successful.
            console.log("signed out")
          }).catch((error) => {
            // An error happened.
            alert(error.message)
          });
    }

    const handleCreateNewListing = async (name, isbn, price, cover)=>{
        const imageRef = ref(storage, `uploads/images/${Date.now()}${cover.name}`)
        const uploadResult = await uploadBytes(imageRef, cover)
        return await addDoc(collection(firestore,'books'),{
            name, 
            isbn,
            price,
            imageUrl : uploadResult.ref.fullPath,
            userID : user.uid,
            userEmail : user.email,
            displayName : user.displayName,
            photoURL : user.photoURL
        })
    }
    const listAllBooks = ()=>{
        return getDocs(collection(firestore, "books"))
    }
    const getBookByID = async(id)=>{
        const docRef = doc(firestore, 'books', id)
        const result = await getDoc(docRef)
        return result
    }
    const getImgURL = (path)=>{
        return getDownloadURL(ref(storage, path))
    }
    const placeOrder =async  (bookId, qty)=>{
         const collectionRef = collection(firestore, "books", bookId, "orders")
        const result = await addDoc(collectionRef,{
            userID : user.uid,
            userEmail : user.email,
            displayName : user.displayName,
            photoURL : user.photoURL,
            qty
        })
        return result
    }
    const fetchMyBooks=async(userId)=>{
        const collectionRef = collection(firestore, "books")
        const q = query(collectionRef, where("userID","==", userId))
        const result =await getDocs(q)
        return result
    }
    const getOrders = async (id)=>{
        const collectionRef = collection(firestore, "books", id, "orders")
        const result = await getDocs(collectionRef)
        return result
    }
    const isLoggedIn = user ? true : false
    return <FirebaseContext.Provider value={{signupUserWithEmailAndPassword, signinUserWithEmailAndPassword, signinWithGoogle,handleCreateNewListing,handleSignOut, listAllBooks, getImgURL,getBookByID,placeOrder,fetchMyBooks,getOrders,isLoggedIn, user}} >
        {props.children}
    </FirebaseContext.Provider>
}