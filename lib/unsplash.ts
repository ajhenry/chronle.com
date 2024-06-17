import { createApi } from "unsplash-js";

const unsplashClient = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export const getImageFromTopic = async (topic: string) => {
  const res = await unsplashClient.search.getPhotos({
    query: topic,
    page: 1,
    perPage: 2,
  });

  if (res.errors) {
    throw new Error(res.errors[0]);
  }

  if (res.response.results.length === 0) {
    return null;
  }

  if (res.response.results.length === 1) {
    return {
      url: res.response.results[0].urls.small,
      name: res.response.results[0].user.name,
      unsplashProfile: res.response.results[0].user.links.self,
    };
  }

  return {
    url: res.response.results[1].urls.small,
    name: res.response.results[1].user.name,
    unsplashProfile: res.response.results[1].user.links.self,
  };
};
