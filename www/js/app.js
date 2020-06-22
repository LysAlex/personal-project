document.addEventListener('DOMContentLoaded', ()=>{

//===== VARIABLES

    let apiUrl = "/api/auth";
    let btnRegister = document.querySelector('#btnRegister');
    let btnLogin = document.querySelector('#btnLogin');
    let btnWriting = document.querySelector('#btnWriting');
    let contents = document.querySelector('#writingList');
    

//===== FUNCTIONS

    btnRegister.addEventListener('click', (event)=>{
        event.preventDefault();
        let emailValue = document.querySelector('#emailRegister').value;
        let nameValue = document.querySelector('#nameRegister').value;
        let passwordValue = document.querySelector('#passwordRegister').value;

        if(emailValue === null || passwordValue === null || nameValue === null){
            //console.log("Veuillez compléter tous les champs");
        } else {
            new FETCHrequest(
                apiUrl+'/register',
                'POST',
                {
                    email: emailValue,
                    password: passwordValue,
                    name: nameValue
                }
            )
            .fetch()
            .then(fetchData=>{
                console.log(fetchData)
                window.location.href = '/';
            })
            .catch(error=>{
                //console.log("L'utilisateur est déjà inscrit");
            })            
        }
    })
    btnLogin.addEventListener('click', (event)=>{
        event.preventDefault();
        let emailValue = document.querySelector('#emailLogin').value;
        let passwordValue = document.querySelector('#passwordLogin').value;

        if(emailValue === null || passwordValue === null){
            //console.log("Veuillez compléter tous les champs");
        } else {
            new FETCHrequest(
                apiUrl+'/login',
                'POST',
                {
                    email: emailValue,
                    password: passwordValue
                }
            )
            .fetch()
            .then(fetchData=>{
                console.log(fetchData)
                localStorage.setItem('email', emailValue);
                localStorage.setItem('password', passwordValue);
                new FETCHrequest(
                    apiUrl+'/me',
                    'GET',
                )
                .fetch()
                .then(fetchData=>{
                    localStorage.setItem('name', fetchData.data.user.name);
                    console.log(fetchData)
                    window.location.href = '/';
                })       
            .catch(error=>{
                console.log("Identifiant ou mot de passe incorrect");
            })            
        })
    }
    })

    btnWriting.addEventListener('click', (event)=>{
        event.preventDefault();
        let titleValue = document.querySelector('#title').value;
        let contentValue = tinyMCE.get('content').getContent()

        if(titleValue === null || contentValue === null){
            //console.log("Veuillez compléter tous les champs");
        } else {
            new FETCHrequest(
                apiUrl+'/me',
                'GET',
            )
            .fetch()
            .then(fetchData=>{
                localStorage.setItem('name', fetchData.data.user.name);
                new FETCHrequest(
                    apiUrl+'/writing',
                    'POST',
                    {
                        title: titleValue,
                        content: contentValue,
                        author: fetchData.data.user.name
                    }
                )
                .fetch()
                .then(fetchData=>{
                    console.log(fetchData)
                    window.location.href = '/';
                })       
            .catch(error=>{
                console.log("Identifiant ou mot de passe incorrect");
            })
        })
    }
    })
    
    const getWritings = ()  => {
        new FETCHrequest(
            apiUrl+'/writing',
            'GET',
        )
        .fetch()
        .then(fetchData=>{
           console.log(fetchData)
           for(let article=0; article < fetchData.data.length; article++){
           writingList.innerHTML += `
           <center>
           <div class="col-4 mt-3 mb-3 article">
           <h6>${fetchData.data[article].title}</h6> 
           <span>${fetchData.data[article].content}</span>
           <span>${fetchData.data[article].author}</span>
           </center>     
           `;
           if (localStorage.getItem('name') == fetchData.data[article].author)
           writingList.innerHTML += ` 
           <center>
           <li class="mt-1" source-id="${fetchData.data[article]._id}">
           <span class="single-content">Modifier</span>
           <i class="fa fa-pencil update-content"></i>
            </li>       
           <li class="mt-1" source-id="${fetchData.data[article]._id}">
           <span class="single-content">Supprimer</span>
           <i class="fas fa-trash-alt trash-content"></i>
            </li>
            </center> 
               
            `
           }
           updateContent();
           removeContent();   
        })
        .catch(error=>{
            console.log(error)
        })              
} 
     const updateContent = () =>{
        let content = document.querySelectorAll('.update-content');
        for(let contents of content){
            contents.addEventListener('click', () =>{
                let id = contents.parentElement.getAttribute('source-id');
                new FETCHrequest(
                    apiUrl+'/writing/'+id,
                    'GET',
                )
                .fetch()
                .then(fetchData=>{
                   console.log(fetchData)
                   modify.innerHTML += `
                   <form>
                   <label for="name">Nom :</label>
                   <input type="text" id="titleUpdate" value="${fetchData.data.title}">
                   <textarea id="contentUpdate"> ${fetchData.data.content}
                   </textarea>
                   <button id="btnUpdate" type="submit">Mettre à jour</button>
                   </form>
                   `;
                   let btnUpdate = document.querySelector('#btnUpdate');
                   btnUpdate.addEventListener('click', (event)=>{
                    event.preventDefault();
                    let titleValue = document.querySelector('#titleUpdate').value;
                    let contentValue = document.querySelector('#contentUpdate').value;
                    console.log(titleValue);
                    console.log(contentValue);
            
                    if(titleValue === null || contentValue === null){
                        //console.log("Veuillez compléter tous les champs");
                    } else {
                            new FETCHrequest(
                                apiUrl+'/writing/'+id,
                                'PUT',
                                {
                                    title: titleValue,
                                    content: contentValue,
                                }
                            )
                            .fetch()
                            .then(fetchData=>{
                                console.log(fetchData)
                                window.location.href = '/';
                            })       
                        .catch(error=>{
                            console.log("Identifiant ou mot de passe incorrect");
                        })            
                    }
                })
                .catch(error=>{
                    console.log(error)
                })   
                })
                           
            })
        }
    }

    const removeContent = () =>{
        let content = document.querySelectorAll('.trash-content');
        for(let contents of content){
            contents.addEventListener('click', () =>{
                let id = contents.parentElement.getAttribute('source-id');
                let confirmation = confirm("Voulez vous vraiment supprimer cette histoire ?")
                if (confirmation == true) {
                    fetchRemoveContent(id);
                    contents.parentElement.style.display = 'none'
                }
                else {
                    console.log("Annulation")
                }
            })
        }
    }

    const fetchRemoveContent = (id) => {
        console.log(id)
        fetch(`${apiUrl}/writing/delete/${id}`,{
            method: 'delete',
        })
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(error=>{
            console.log(error);
        })
        window.location.href = '/';
    }

    const checkAuth = ()  => {
                new FETCHrequest(
                    apiUrl+'/me',
                    'GET',
                )
                .fetch()
                .then(fetchData=>{
                    if (fetchData != null) {
                        document.getElementById('registerForm').style.display = 'none';
                        document.getElementById('loginForm').style.display = 'none';
                        bienvenue.innerHTML = `Bienvenue ${fetchData.data.user.name}  <button id="btnLogout" type="submit">Se déconnecter</button> `
                        let btnLogout = document.querySelector('#btnLogout');
                            btnLogout.addEventListener('click', ()=>{
                                    localStorage.removeItem('email');
                                    localStorage.removeItem('password');
                                    localStorage.removeItem('name');
                                    new FETCHrequest(
                                        apiUrl+'/logout',
                                        'GET',
                                    )
                                    .fetch()
                                    .then(fetchData=>{
                                        console.log(fetchData)
                                        window.location.href = '/';
                                    })       
                                    .catch(error=>{
                                        console.log(error)
                                    })
                                    
                                    
                                })    
                            } else {
                                console.log("Pas connecté");
                            }       
                })
                .catch(error=>{
                    console.log(error)
                })
                            
                
        } 
    checkAuth();
    getWritings();
})