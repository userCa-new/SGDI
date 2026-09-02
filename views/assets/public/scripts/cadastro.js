const form = document.querySelector("#signup-form");

form.addEventListener('submit', async (e) =>{
    e.preventDefault();
    const tipo = document.querySelector("#tipo");
    const formData = new FormData(form);
    const tiposelecionado = tipo.value;
    if(tiposelecionado == "inquilino"){
        formData.set("type_user", 1);
    }else if(tiposelecionado == "proprietario")
    {
        formData.set("type_user", 2);
    }
     const response = await fetch("http://localhost/SGDI/api/users/register", {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    console.log(data);
    const dataObj = Object.fromEntries(formData.entries());

    console.log(dataObj);


   

   
})