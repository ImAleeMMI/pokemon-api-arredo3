const apiBaseUrl = "https://pokeapi.co/api/v2/"; // API Base url
var page;
const limit = 6;

document.addEventListener('DOMContentLoaded', () => {

  page = localStorage.getItem('page');
  if(!page || page  === undefined){
    localStorage.setItem('page', 1);
    page = 1;
  }
  let offset = getOffset(limit, page);
  generateListPokemon(limit, offset);


});

function generateListPokemon(limit, offset){

  // Chiamata alla funzione che effettua la chiamara API | restituisce una Promise
  getPokemonList(limit, offset).then((pokemonList) => {
    return pokemonList.json() // Codifico il JSON restituito | restituisce una Promise
  }).then((data) => {
    let list = data.results  // Data è l'oggetto restituito precedentemente. Valorizzo list con i dati ricevuto

    // Creo una promise a cui passo una funzione asincrona
    let prom = new Promise(async (resolve) => {

      //Invoco await Promise.all e passo il risultato di array.map
      await Promise.all(list.map(async (pokemonOrig) => {

        // Chiamata API
        return await getPokemonDetails(pokemonOrig.url).then((pokemon) => {

          // Decodifica JSON di ritorno
          return pokemon.json()
        }).then((pokemon) => {

          // Aggiungo i dettagli restituiti all'oggetto Pokemon originale
          pokemonOrig.details = pokemon
        }).catch((e) => alert(e.message))
      }))
      
      // Risolvo la promise restituiendo l'array aggiornato
      return resolve(list)
    })


    // Ritorno la promise (comportamento previsto all'interno di .then)
    return prom
  }).then((listOk) => {
    let prom = new Promise(async (resolve) => {

      //Invoco await Promise.all e passo il risultato di array.map
      await Promise.all(listOk.map(async (pokemonWithDetail) => {
        // Chiamata API
        return await getPokemonCharacteristics(pokemonWithDetail.details.id).then((pokemon) => {
          // Decodifica JSON di ritorno

          if (pokemon.ok) {
            return pokemon.json()
          }
          return Promise.resolve({})

        }).then((pokemon) => {
          // Aggiungo i dettagli restituiti all'oggetto Pokemon originale
          pokemonWithDetail.characteristics = pokemon
        }).catch((e) => alert(e.message))
      }))
      // Risolvo la promise restituiendo l'array aggiornato
      return resolve(listOk)
    })

    // Ritorno la promise (comportamento previsto all'interno di .then)
    return prom
  }).then((listOK) => {
    // Eseguo la funzione che stampa i pokemon
    showPokemonList(listOK)
  }).catch((e) => {
    alert(e.message)
  })
}

function getOffset(limit, page){
  offset = (page-1)*limit;
  if(page == 1){
    return 0;
  }
  return offset;
}

function showPokemonList(pokemonArray) {
  const container = document.getElementById('pokemon-list')
  container.innerHTML = "";
  //const loader = document.getElementById('loader')


  setTimeout(() => {
    //loader.remove() //rimuovo il loader

    pokemonArray.forEach((pokemon) => {

      // Card
      let card = document.createElement("div")
      card.classList.add('card')
      card.classList.add(pokemon.details.types[0].type.name)

      card.innerHTML = `<h4>${pokemon.name}</h4>` // titolo
      container.appendChild(card)

      // Immagine
      let img = document.createElement("img")
      img.classList.add('pokemon-img')
      //img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.details.id}.svg`
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.details.id}.png`
      card.appendChild(img)

      let height = (pokemon.details.height * 10).toFixed(2);
      let weight = (pokemon.details.weight * 0.1).toFixed(2);

      let info = document.createElement("div")
      info.classList.add('info')
      info.innerHTML = ''

      if (pokemon.characteristics && pokemon.characteristics.descriptions && pokemon.characteristics.descriptions[6]) {
        info.innerHTML += `<h5><strong>${pokemon.characteristics.descriptions[6].description}</strong></h5>` // peso
      }

      info.innerHTML += `<p>Punti esperienza <strong>${pokemon.details.base_experience}</strong></p>` // titolo
      info.innerHTML += `<p>Altezza: <strong>${height}cm</strong></p>` // altezza
      info.innerHTML += `<p>Peso: <strong>${weight}kg</strong></p>` // peso

      card.appendChild(info)

      let btn = document.createElement("a")
      btn.classList.add('btn')
      btn.innerHTML = 'Scopri di pi&ugrave;'
      btn.addEventListener('click', () => showPokemon(pokemon))
      card.appendChild(btn)

    }, 2000)  // Timeout di 2 sec per loader
  })

}

function getPokemonList(limit, offset) {
  const listRoute = apiBaseUrl + `pokemon?limit=${limit}&offset=${offset}`;
  const pokeContainer = document.getElementById('pokemon-list')
  return fetch(listRoute,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
}

function nextPage(){
  page = localStorage.getItem('page');
  page = 1 + parseInt(page)

  let offset = getOffset(limit, page);
  generateListPokemon(limit, offset);
  localStorage.setItem("page", page);
}

function prevPage(){
  page = localStorage.getItem('page');
  page = parseInt(page) - 1

  let offset = getOffset(limit, page);
  generateListPokemon(limit, offset);
  localStorage.setItem("page", page);
}



function showPokemon(pokemon) {

  const myPopup = document.getElementById('myPopup');
  const myPopupData = document.getElementById('my-popup-data');
  const closePopup = document.getElementById('closePopup');

  document.body.style.overflow = 'hidden';

  myPopupData.innerHTML = '';

  // Mostra il popup quando viene cliccato il pulsante
  myPopup.style.display = 'block';

  // Chiudi il popup quando viene cliccato il pulsante di chiusura
  closePopup.addEventListener('click', function () {
    // Abilita lo scroll quando il popup viene chiuso
    document.body.style.overflow = 'auto';
    myPopup.style.display = 'none';
  });

  // Chiudi il popup quando viene cliccato al di fuori del popup
  window.addEventListener('click', function (event) {
    if (event.target == myPopup) {
      // Abilita lo scroll quando il popup viene chiuso
      document.body.style.overflow = 'auto';
      myPopup.style.display = 'none';
    }
  });

  getSinglePokemon(pokemon.details.id).then(result => {
    return result.json()
  }).then(myPokemon => {

    console.log(myPokemon)

    myPopupData.innerHTML = `<h4>${myPokemon.name}</h4>` // titolo

    // Immagine
    let img = document.createElement("img")
    img.classList.add('pokemon-img')
    //img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemon.details.id}.svg`
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${myPokemon.id}.png`
    myPopupData.appendChild(img)

    let height = (myPokemon.height * 10).toFixed(2);
    let weight = (myPokemon.weight * 0.1).toFixed(2);

    let info = document.createElement("div")
    info.classList.add('info')
    info.innerHTML = ''

    /*
    if (myPokemon.characteristics && myPokemon.characteristics.descriptions && myPokemon.characteristics.descriptions[6]) {
      info.innerHTML += `<h5><strong>${myPokemon.characteristics.descriptions[6].description}</strong></h5>` // peso
    }
    */

    info.innerHTML += `<p>Punti esperienza <strong>${myPokemon.base_experience}</strong></p>` // titolo
    info.innerHTML += `<p>Altezza: <strong>${height}cm</strong></p>` // altezza
    info.innerHTML += `<p>Peso: <strong>${weight}kg</strong></p>` // peso

    myPopupData.appendChild(info)



  }).catch(e => alert(e.message));


}

function getPokemonDetails(url) {
  return fetch(url,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
}


function getPokemonCharacteristics(id) {
  let url = apiBaseUrl + `characteristic/${id}/`

  return fetch(url,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
}

function getSinglePokemon(id) {
  let url = apiBaseUrl + `pokemon/${id}/`

  return fetch(url,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
}


/*
async function getPokemonListArray(limit){
  const listRoute = apiBaseUrl + "pokemon?limit=" + limit
  const pokeContainer = document.getElementById('pokemon-list')
  let pokemonListCall = await fetch(listRoute,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });

  if(pokemonListCall.ok){
    let pokemonListData = await pokemonListCall.json();
    let pokemonList = pokemonListData.results;

    await pokemonList.map( async pokemon => {
      let pokemonListCall =  await getPokemonDetails(pokemon.url)

      let detail = await pokemonListCall.json()
      pokemon['details'] = detail
      return pokemon
    });

    return pokemonList;

  }
  else{
    alert('ko')
  }
}
*/
