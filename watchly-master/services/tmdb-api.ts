import tmdb from "./tmdb";

export const getDiscoverMovies = async ({
    page = 1,
    genre,
    sortBy,
    adult = false,
    from,
    to,
}: {
    page?: number;
    genre?: string;
    sortBy?: string;
    adult?: boolean;
    from?: string;
    to?: string;
}) => {

    const params = new URLSearchParams({
        page: String(page),
        include_adult: String(adult),
        sort_by: sortBy || "popularity.desc",
    });
    if (genre) {
        params.append("with_genres", genre);
    }

    if (from) {
        params.append("primary_release_date.gte", from);
    }

    if (to) {
        params.append("primary_release_date.lte", to);
    }

    const response = await tmdb.get(
        `/discover/movie?${params.toString()}&region=IN`
    );

    return response.data;
};
export const getDiscoverTvSeries = async ({
    page = 1,
    genre,
    sortBy,
    adult = false,
    from,
    to,
}: {
    page?: number;
    genre?: string;
    sortBy?: string;
    adult?: boolean;
    from?: string;
    to?: string;
}) => {

    const params = new URLSearchParams({
        page: String(page),
        include_adult: String(adult),
        sort_by: sortBy || "popularity.desc",
    });

    if (genre) {
        params.append("with_genres", genre);
    }

    if (from) {
        params.append("first_air_date.gte", from);
    }

    if (to) {
        params.append("first_air_date.lte", to);
    }

    const response = await tmdb.get(
        `/discover/tv?${params.toString()}`
    );

    return response.data;
};
export const getNowPlayingMovies = async () => {
    const response = await tmdb.get(
        `/movie/now_playing?language=en-US&page=1&region=IN`
    );
    return response.data;
};

export const searchApi = async (query: string, type: 'movie' | 'tv' | 'multi', page: number = 1) => {
    const response = await tmdb.get(`/search/${type}?query=${query}&include_adult=true&language=en-US&page=${page}`)
    return response.data;
}

export const getMovieDetails = async (id: number) => {
    const response = await tmdb.get(
        `/movie/${id}?language=en-US&append_to_response=videos,credits,release_dates`
    );
    return response.data;
};

export const getSeriesDetails = async (id: number) => {
    const response = await tmdb.get(
        `/tv/${id}?language=en-US&append_to_response=videos,credits,content_ratings`
    );
    return response.data;
};

export const getSeasonDetails = async (seriesId: number, seasonNumber: number) => {
    const response = await tmdb.get(
        `/tv/${seriesId}/season/${seasonNumber}?language=en-US`
    );
    return response.data;
};
