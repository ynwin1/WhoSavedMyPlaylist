## WhoSavedMyPlaylist
WhoSavedMyPlaylist is a tool to (potentially) find out who saved your created playlists on Spotify.

## A Story
I have always wanted to know who saved my playlists, especially when I have one with about 15 followers. I digged around the topic, learning that Spotify used to have this feature for a brief stinct before permanently removing it.

Looking at some forums online, I see that this feature is wanted by many users, but to them, it still remains a mystery who saved their playlists. This is possibly a feature gap that can be addressed, but I found that no one has done this, which took me by surprise. 

Looking at this issue from an ethical perspective, it is definitely not ethical to intrude someone's profile to retrieve their playlists. Doing so would require abusing Spotify API to brute force every possible UserID and check if they have your playlist ID. Spotify simply won't allow this to happen.

So, to comply with ethics, I came up with this idea where when a user logs in to my platform with their Spotify credentials, not only they get to see who saved their public playlists but also give away what playlists they have followed. It's a Give & Take situation. This way, the user understands that they need to grant permission to get things going, which is the consent I need. The downside of this idea is that the user may not see who subscribed their playlist unless they join my platform. Until then, it will be a mystery. 

Then, I hit the roadblock. Midway through working on this project, I discovered that Spotify only allow a maximum of 25 people to use any app created on their platform whle in the development mode. They mentioned that extra quota can be requested subjected to manual approval of the app from Spotify. I decided to stop at this point, because if I could only get 25 people max, I am not going to achieve what I want. Not only that, even in the development mode, the creator of the app must add the potential users manually to my app's setting on Spotify before the user is able to use the app. 

Then, I wrapped up the last few features I wanted to add, and stopped. I have a pretty much fully functional project except that I will not get more than 25 users, and you will need me to use the app which is very inconvienient.

The app is available at https://whosavedmyplaylist.onrender.com. It may take a while to load because it is on Render, and Render spins down the service if there is no activity for more than 10 minutes.
* Chrome has a very strict cookie system and prevents you from using the app. Any other web browser is fine. Browsing the issue online, I found that this could possibly be a library error. There are quite a few developers facing the same issue with the latest version of a library I am using. I will check again when more details are released.

# Technical Aspect

The project is created using Next.js, Tailwind CSS and MongoDB.

## Structure

There are only two models; User and Playlist. Each contains information of the other, making it easy to retrieve user info and playlist information.

## Database Optimizations

### Caching System

This app could result in a lot of API calls to Spotify and data fetches from database if not properly managed. To address this, I have a caching system embedded in the system.

With caching system, I implemented 3 ways of fetching data.

1. Fetching from Spotify through its APIs - This is only carried out when the user logs in or refreshes data as their will. After this is done, all the necessary data needed to operate later will already be in the database.

2. Fetching from database - This is carried out only when the user browses other pages for the first time. Think of a scenario where you go to the home page and goes back to your dashboard. You don't want to be calling APIs from Spotify again because you are still in session, and Spotify data shouldn't change much. However, if the user wants the latest data, refresh button is available to fetch what the user desires.

3. Fetching from the cache - The cache is where most data fetches will be made. A unique key with the data for each page is stored in the cache after database fetch is made. This way, going back and forth between any page is a lot faster and eliminates abusing the API calls and database queries.

### Paginations & Items Per Page

For an app that will deal a lot with database queries, I need to have efficient queries made.

Especially when there could be thousands of followers for a playlist or hundreds of playlists per user, I need to divide the dataset into smaller chunks so that queries can be made faster while displaying data at a feasible size that the user can take in.

That's the reason I implemented Pagination & Items Per Page. This way, I only query what the user wants to see and it also gives the user control over how many they want to see at a time. Efficient ways, Happier Users.

# A Preview

![WSMPHome](https://github.com/user-attachments/assets/de487d4e-8bb7-4ca3-a8fe-0efe2b0cbc43)

![WSMP2](https://github.com/user-attachments/assets/00eae31c-feea-4f23-b4c4-b95d3be513c8)

![WSMP1](https://github.com/user-attachments/assets/a1b98580-06e2-428f-af3f-86d9fc688195)

![WSMP3](https://github.com/user-attachments/assets/81cd0921-4843-485b-95f9-cce74eb759c6)



  


