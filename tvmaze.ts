import axios from "axios";
import * as $ from "jquery";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const TV_MAZE_BASE_URL = "https://api.tvmaze.com/";
const TV_MISSING_IMG = "https://tinyurl.com/missing-tv";

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
}

interface ShowFromApiInterface extends ShowInterface {
  image: { medium: string } | null;
}

interface ShowOutputInterface extends ShowInterface {
  image: string;
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowOutputInterface[]> {
  const results = await axios({
    url: `${TV_MAZE_BASE_URL}search/shows?q=${term}`,
    method: "get",
  });

  let shows: ShowOutputInterface[] = results.data.map(
    (result: { show: ShowFromApiInterface }): ShowOutputInterface => {
      let show = result.show;

      return {
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image?.medium || TV_MISSING_IMG,
      };
    }
  );

  return shows;
}

/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows: ShowOutputInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" data-show-id="${show.id}">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term: string = $("#searchForm-term").val() as string;
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

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const results = await axios({
    url: `${TV_MAZE_BASE_URL}shows/${id}/episodes`,
    method: "get",
  });

  let episodes: EpisodeInterface[] = results.data.map(
    (result: EpisodeInterface): EpisodeInterface => {
      return {
        id: result.id,
        name: result.name,
        season: result.season,
        number: result.number,
      };
    }
  );

  return episodes;
}

/** Given list of episodes like [{ id, name, season, number },...],
 * create markup for each and add to DOM */

function populateEpisodes(episodes: EpisodeInterface[]): void {
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`
    );
    $episodesArea.append($episode);
  }
  $episodesArea.show();
}

/** handler to call API to get episodes and display them on the DOM */

async function episodesHandler(evt: JQuery.ClickEvent): Promise<void> {
  const showId: number = evt.target.getAttribute("data-show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

/** event listener for Get Episodes buttons */

$showsList.on(
  "click",
  ".Show-getEpisodes",
  async function (evt: JQuery.ClickEvent) {
    evt.preventDefault();
    await episodesHandler(evt);
  }
);
