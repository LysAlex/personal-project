class FETCHrequest {

    constructor(url, requestType, data = null) {
        this.url = url;
        this.requestType = requestType;
        this.data = data;

        // Définition du header de la requête
        this.requestHeader = {
            method: requestType,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Ajouter les données dans les requêtes POST, DELETE et PUT
        if( this.requestType === 'POST' || this.requestType === 'PUT' || this.requestType === 'DELETE'){
            this.requestHeader.body = JSON.stringify(data);
        };
    }

    fetch() {
        return new Promise((resolve, reject) => {
            fetch(this.url, this.requestHeader)
                .then(apiResponse => {
                    if (apiResponse.ok) {
                        return apiResponse.json();
                    }
                    else {
                        return apiResponse.json()
                           .then(error => reject(error))
                    };
                })
                .then(jsonData => {
                    resolve(jsonData)                    
                })
                .catch(apiError => reject(apiError));
        })
    }
}