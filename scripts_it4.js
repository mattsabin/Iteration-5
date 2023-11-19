if(document.title =="Listener Page"){document.addEventListener("DOMContentLoaded", populateLikedSongToListenerPage);}
if(document.title =="Remove Songs Page"){document.addEventListener("DOMContentLoaded", populateLikedSongs);}
const listener_button = document.getElementById("listener-button");
const add_page_button = document.getElementById("add-page-button");
const remove_page_button = document.getElementById("remove-page-button");
const log_out_button = document.getElementById("log-out-button");
const songs_search_bar = document.getElementById("song-search-bar");
const resultsList = document.getElementById('song-list');  
const remove_search_bar = document.getElementById("remove-search-bar");
const add_song_button = document.getElementById("addSongButton");
const remove_song_button = document.getElementById("removeSongButton");



function listenerButtonHandler() {
    window.location.href = '/';
}

function addPageButtonHandler() {
    window.location.href = '/add-songs';
}

function removePageButtonHandler() {
    window.location.href = '/remove-songs';
}

async function logout() {
    fetch('/shutdown', {
      method: 'POST',
    })
    .then(response => response.text())
    .then(message => {
      console.log(message);
    })
    .catch(error => {
      console.error('Error during logout:', error);
    });
  }

async function populateLikedSongs(){
    const likedList = document.getElementById('liked-songs-list');
    if(likedList != null){
        if( likedList.innerHTML != null){
            likedList.innerHTML = '';
            const response =  await fetch(`/getLikedSongs`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result =  await response.json();
             // Iterate through each entry in the results array
            result.forEach(song => {
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            const label = document.createElement('label');
            checkbox.type = 'checkbox';
            label.textContent = song.title + " -- " + song.artist;
            listItem.appendChild(checkbox);
            listItem.appendChild(label);
            likedList.appendChild(listItem);
            });
        }
    }
    return;
}

async function populateLikedSongToListenerPage(){
    const listener_page_liked_songs = document.getElementById("listenerPageLikedSongs");
    const listener_page_liked_artists = document.getElementById("listenerPageLikedArtists");
    if(listener_page_liked_songs != null){
        console.log("not null");
        listener_page_liked_songs.innerHTML = '';
        listener_page_liked_artists.innerHTML = '';
        const response =  await fetch(`/getLikedSongs`);
        const response2 = await fetch(`/uniqueArtists`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        const result2 = await response2.json();
        console.log(result2);

        result.forEach(song => {
            const listItem = document.createElement('li');
            const label = document.createElement('label');
            label.textContent = song.title + " -- " + song.artist;
            listItem.appendChild(label);
            listener_page_liked_songs.appendChild(listItem);
        });
        result2.forEach(artist => {
            const listItem = document.createElement('li');
            const label = document.createElement('label');
            label.textContent = artist;
            listItem.appendChild(label);
            listener_page_liked_artists.appendChild(listItem);
        });
    }
    else{console.log("very null");}
}

async function addSongToLikedSongs(){
    const checkedSongs = collectCheckedLabels(resultsList);
    checkedSongs.forEach(async song =>{
        const response =  await fetch(`/addToLikedSongs?term=${song}`);
    })
    refreshPage();
}

function collectCheckedLabels(songList) {
    //const songList = document.getElementById('song-list'); 
    const listElements = songList.querySelectorAll('li');
    console.log("Song list length: " + listElements.length);
    const checkedLabels = [];
    console.log(listElements);
    listElements.forEach(listElement => {
        const checkbox = listElement.querySelector('input');
        let label = listElement.querySelector('label').innerText;
        console.log(label);
        console.log(checkbox);
        if (checkbox.checked) {
            console.log("Box checked");
            const songName = label.split(' -- ')[0].trim();
            console.log(songName);
            checkedLabels.push(songName);
        }
        else{console.log("Not checked");}
    });
    console.log("end of collectCheckedLabels");
    console.log(checkedLabels);
    return checkedLabels;
}

function refreshPage() {
    location.reload();
}

async function removeSongFromLikedSongs(){
    console.log("removeSongFromLikedSongs");
    const likedSongList = document.getElementById("liked-songs-list");
    const checkedSongs = collectCheckedLabels(likedSongList);
    console.log("DELETED SONGS: " + checkedSongs);
    checkedSongs.forEach(async song =>{
        const response =  await fetch(`/removeFromLikedSongs?term=${song}`);
    })
    await populateLikedSongs();
    refreshPage();
}


listener_button.addEventListener("click", listenerButtonHandler);
add_page_button.addEventListener("click", addPageButtonHandler);
remove_page_button.addEventListener("click", removePageButtonHandler);
log_out_button.addEventListener("click", logout);

if(songs_search_bar != null){
songs_search_bar.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
        // User input from the search bar
        const searchTerm = event.target.value.toLowerCase();

        try {
            // Make a fetch request to the server
            const response = await fetch(`/search?term=${searchTerm}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            const result = await response.json();
            console.log(result);

            // Clear previous search results
            resultsList.innerHTML = '';

            // Iterate through each entry in the results array
            result.forEach(song => {
                const listItem = document.createElement('li');
                const checkbox = document.createElement('input');
                const label = document.createElement('label');
                checkbox.type = 'checkbox';
                label.textContent = song.title + " -- " + song.artist;
                listItem.appendChild(checkbox);
                listItem.appendChild(label);
                resultsList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
});
}
if(add_song_button != null){add_song_button.addEventListener("click", addSongToLikedSongs);}
if(remove_song_button != null){remove_song_button.addEventListener("click", removeSongFromLikedSongs);}






function findSongs(titleToFind) {
    const matchingSongs = [];
    const lowerCaseTitleToFind = titleToFind.toLowerCase();

    for (const song of songs) {
        const { title, artist, album } = song; // recreate song properties

        if (
            title.toLowerCase().includes(lowerCaseTitleToFind) ||
            artist.toLowerCase().includes(lowerCaseTitleToFind) ||
            album.toLowerCase().includes(lowerCaseTitleToFind)
        ) {
            matchingSongs.push(song); // Add the song to the list if any property matches
        }
    }

    return matchingSongs.length > 0 ? matchingSongs : null; // Return the list or null if no matches are found
}


