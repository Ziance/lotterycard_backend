const {readFileSync}=require("fs");
let loadexample=()=>{
    let data=JSON.parse(readFileSync("../Json/example.json"));
return data;
}

console.log(loadexample())
