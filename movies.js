/** movies.js **/

/* Function which accepts a request URI, builds an XML http request, 
sends the request and handles the response by calling the response handler */
function sendXhr(requestURI, responseHandler) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", requestURI);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = responseHandler;
    xhr.send(null);
}

/* Function which gets the user entered search query, builds a request URI
and calls the sendXhr method */
function sendRequestToSearchMovie() {
    var query = encodeURI(document.getElementById("form-input").value);
    var requestURI = "proxy.php?method=/3/search/movie&query=" + query;
    sendXhr(requestURI, processResponseToMovieSearchResults);
}

/* Function which processes and displays the results of the movie search */
function processResponseToMovieSearchResults() {
	var html = "Movie search results..<br><br>";
    if (this.readyState == 4 && this.status == 200) {
        var json = JSON.parse(this.responseText);
        if (json.results.length > 0) {
            for (var idx = 0; idx < json.results.length; idx++) {
                var movieTitle = json.results[idx].title;
				var releaseYear = "";
				if(json.results[idx].release_date != null) {
					releaseYear = json.results[idx].release_date.split("-")[0]
				} else {
					releaseYear = "-";
				}
				var movieTitleAndYear = movieTitle + " (" + releaseYear + ")"; // Eg: "The Matrix (1999)"
                var movieId = json.results[idx].id;
                html += "<li><a class='movieLink' href='#' onclick='sendRequestToGetMovieInfo(" + movieId + ");'>" + 
				movieTitle + "</a></li>";
            }
        } else {
			html += "No results found..Please try with another keyword";
        }
    } else {
		html += "Server error! please try again later";
    }
	document.getElementById("output").innerHTML = html;
}

/* Function which accepts movie ID as input and builds a request URI to 
get the cast information  and calls the sendXhr method */
function sendRequestToGetMovieCast(movieId) {
    requestURI = "proxy.php?method=/3/movie/" + movieId + "/credits";
    sendXhr(requestURI, processResponseToMovieCast);
}

/* Function which processes and displays the results of the cast search */
function processResponseToMovieCast() {
	var castLimit = 5;
	var html = "Top cast: ";
    if (this.readyState == 4 && this.status == 200) {
        var json = JSON.parse(this.responseText);
		
		if(json.cast.length > 0) {
			for (var idx = 0; idx < json.cast.length; idx++) {
				var castName = json.cast[idx].name;
				html += "<li><a href='http://en.wikipedia.org/wiki/" + castName + "'>" + castName + "</a></li>";
				if (idx == castLimit-1) {
					break;
				}
			}
		} else {
			html += "No cast details found";
		}
    } else {	
		html += "Server error! please try again later";
	}
	document.getElementById("cast").innerHTML = html;
}


/* Function which accepts movie ID as input and builds a request URI to 
get the movie information and calls the sendXhr method. 
It also calls the sendRequestToGetMovieCast(movieId) method */
function sendRequestToGetMovieInfo(movieId) {
    requestURI = "proxy.php?method=/3/movie/" + movieId;
    sendXhr(requestURI, processResponseToMovieInfo);
    sendRequestToGetMovieCast(movieId);
}

/* Function which processes and displays the results of the movie info search */
function processResponseToMovieInfo() {
	var html = "";
    if (this.readyState == 4 && this.status == 200) {
        var json = JSON.parse(this.responseText);
        var moviePosterURL = json["poster_path"];
        var movieTitle = json["title"];
        var movieGenres = [];
        for (var idx = 0; idx < json.genres.length; idx++) {
            movieGenres[idx] = json.genres[idx].name;
        }
        var movieOverview = json["overview"];
        html = "<img src='http://image.tmdb.org/t/p/w185" + moviePosterURL + "' alt='No image'><li>Title: " + 
		movieTitle + "</li><li>Genres: " + movieGenres + "</li><li>Overview: " + movieOverview + "</li>";
    } else {
		html = "Server error! please try again later";
	}
	document.getElementById("movieinfo").innerHTML = html;
}
/* Function which takes an event as input and triggers the 
search button click if it is the enter key (13) */
function searchKeyPress(e) {
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13) {
        document.getElementById('btnSearch').click();
        return false;
    }
    return true;
}
