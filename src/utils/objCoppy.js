//把obj1的資料複製到obj2
export default async function objCoppy(obj1,obj2){
    Object.keys(obj2).forEach(key =>{
        obj2[key] = obj1[key]
    })
}