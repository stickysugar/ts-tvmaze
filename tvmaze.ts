import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const TVMAZE_BASE_URL = "https://api.tvmaze.com/";
const TV_MISSING_IMG = "https://tinyurl.com/missing-tv";


interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const response = await axios.get(`${TVMAZE_BASE_URL}search/shows?q=${term}`);

  // if (typeof response === ) {

  // }

  let shows: ShowInterface[];

  for (let resp of response) {
    let show = resp.show;
      let show: ShowInterface = {
        id: resp.show.id,
        name: resp.show.name,
        summary: resp.show.summary,
        image: resp.show.image || TV_MISSING_IMG
      }
  }
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Object[]): void {
  $showsList.empty();


  for (let show of shows) {

    if (typeof show.show.image.medium === null) {
      show.show.image.medium = TV_MISSING_IMG;
    }

    const $show = $(
      `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.show.image.medium}
              alt=${show.show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }