/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author ?
*/

const serverStoreUrl = "http://localhost:4000/store";

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

export const createPlaylist = async (newListName, newSongs, userEmail) => {
    const response = await fetch(serverStoreUrl + "/playlist", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail
        })
    });
    return response;
}

export const deletePlaylistById = async (id) => {
    const response = await fetch(serverStoreUrl + "/playlist/" + id, {
        method: "DELETE",
        credentials: "include",
    });
    return response;
}

export const getPlaylistById = async (id) => {
    const response = await fetch(serverStoreUrl + "/playlist/" + id, {
        method: "GET",
        credentials: "include"
    })
    return response;
}

export const getPlaylistPairs = async () => {
    const response = await fetch(serverStoreUrl + "/playlistpairs", {
        method: "GET",
        credentials: "include"
    });
    return response;
}

export const updatePlaylistById = async (id, playlist) => {
    const response = await fetch(serverStoreUrl + "/playlist/" + id, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            playlist: playlist
        })
    });
    return response;
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis
