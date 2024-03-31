// import { TAppSlice } from "store/app/types";

// export const getAppData = (data: IDBObjectStoreParameters) => {
//     let openRequest = indexedDB.open("hangman", 1);
    
//     openRequest.onupgradeneeded = function() {
//         console.log('indexDB / onupgradeneeded');
//         let db = openRequest.result; 
//         db.createObjectStore('hangman', { keyPath: 'id' })
//         // срабатывает, если на клиенте нет базы данных
//         // ...выполнить инициализацию...
//     };
    
//     openRequest.onerror = function() {
//         console.error("Error", openRequest.error);
//     };
    
//     openRequest.onsuccess = function() {
//         let db = openRequest.result; 
//         console.log({db});
        
//     };
// }